"use client"
import React from "react"
import StyledWindow from "@mCmps/StyledWindow";
import { useStateObjNull } from "@/utils/useStateObj";
import { useMutationQuestOpen, useQuests, type Quest } from "@/api/quest";
import Textbox from "@mCmps/Textbox";
import Title from "@mCmps/Title";
import IconCheck from "@icons/check";
import { useTitle } from "@/utils/useTtile";
import useGameDialog from "@/components/GameDialog";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import Link from "next/link";
import styles from "./page.module.css"

export default function Page()
{
	useTitle("Квесты");
	const dialog = useGameDialog();
	const mutationOpen = useMutationQuestOpen();
	const quests = useQuests();
	const quest = useStateObjNull<Quest>(null, v =>
	{
		if (v && v.dialogId != null && !v.opened)
			dialog.run(v.dialogId, () =>
			{
				mutationOpen.mutate(v.id);
				v.opened = true;
			});
	});

	return (
		<StyledWindow className={styles.root} scrollUpdate={quest.v} onClose={quest.setNull} title={"quests" + (quest.v ? `/${slug(quest.v.name)}` : "")}
			footer={<Link href="/scanner" className={styles.btn}>
				<Textbox primary className={styles.btn__box}>
					<Title small text="Сдать" />
				</Textbox>
			</Link>}
		>
			{dialog.el()}
			{quests.isLoading && <Spinner />}
			{!quest.v ?
				<div className={styles.quests}>
					<Title text="Квесты:" />
					{displayError(quests)}
					{quests.data?.map(q =>
						<button key={q.id} onClick={() => quest.set(q)}>
							<Textbox darkbg className={styles.quest}>
								<div>{q.name}</div>
								<div>{q.completed ? <IconCheck /> : `${q.reward}M`}</div>
							</Textbox>
						</button>
					)}
				</div>
				:
				<div className={styles.questScreen}>
					<button onClick={quest.setNull}>
						<Textbox darkbg className={styles.quest}>
							<div>{quest.v.name}</div>
							<div>{quest.v.completed ? <IconCheck /> : `${quest.v.reward}M`}</div>
						</Textbox>
					</button>
					{quest.v.dialogId != null &&
						<button className={styles.btnIntro} onClick={() => quest.v?.dialogId != null && dialog.run(quest.v.dialogId)}>
							<Textbox primary className={styles.btnIntro__box}>
								<Title small text="Вступление" className={styles.btnIntro__text} />
							</Textbox>
						</button>
					}
					<div>{quest.v.description || "Нет описания"}</div>
				</div>
			}
		</StyledWindow>
	);
}

function slug(text: string)
{
	const L = {
		"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "ё": "e", "е": "e",
		"ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
		"н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
		"ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "",
		"ы": "ey", "ь": "", "э": "e", "ю": "yu", "я": "ya",
	} as { [_: string]: string }
	return text.toLowerCase().split("").map(ch => L[ch] || ch).join("")
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes;
}