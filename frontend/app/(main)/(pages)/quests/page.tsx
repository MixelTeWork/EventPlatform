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
import Textbox2 from "@mCmps/Textbox2";

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
				<Textbox2 small>
					<Title small text="Сдать" className={styles.btn__box} />
				</Textbox2>
			</Link>}
			invisible
		>
			{dialog.el()}
			{quests.isLoading && <Spinner />}
			{!quest.v ?
				<div className={styles.quests}>
					{/* <Title text="Квесты:" /> */}
					{displayError(quests)}
					{quests.data?.map(q =>
						<button key={q.id} onClick={() => quest.set(q)}>
							{/* <Textbox darkbg className={styles.quest}>
								<div>{q.name}</div>
								<div>{q.completed ? <IconCheck /> : `${q.reward}M`}</div>
							</Textbox> */}
							<div className={styles.quest}>
								<Textbox2 small><div className={styles.quest__title}>{q.name}</div></Textbox2>
								<div>{q.completed ? <IconCheck /> : `${q.reward}G`}</div>
							</div>
						</button>
					)}
				</div>
				:
				<div className={styles.questScreen}>
					<button onClick={quest.setNull}>
						{/* <Textbox darkbg className={styles.quest}>
							<div>{quest.v.name}</div>
							<div>{quest.v.completed ? <IconCheck /> : `${quest.v.reward}M`}</div>
						</Textbox> */}
						<div className={styles.quest}>
							<Textbox2 small><div className={styles.quest__title}>{quest.v.name}</div></Textbox2>
							<div>{quest.v.completed ? <IconCheck /> : `${quest.v.reward}G`}</div>
						</div>
					</button>
					{quest.v.dialogId != null &&
						<button className={styles.btnIntro} onClick={() => quest.v?.dialogId != null && dialog.run(quest.v.dialogId)}>
							{/* <Textbox primary className={styles.btnIntro__box}>
								<Title small text="Вступление" className={styles.btnIntro__text} />
							</Textbox> */}
							<Textbox2 small>
								<div className={styles.btnIntro__box} style={{padding: "0.75rem 1rem"}}>
									<Title small text="Вступление" className={styles.btnIntro__text} />
								</div>
							</Textbox2>
						</button>
					}
					<div className={styles.questScreen__desc}>{quest.v.description || "Нет описания"}</div>
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