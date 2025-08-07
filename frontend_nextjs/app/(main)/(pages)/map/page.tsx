"use client"
import styles from "./page.module.css"
import map1 from "./map1.png";
import map2 from "./map2.png";
import map3 from "./map3.png";
import mark_0 from "./marks/0.png";
import mark_1_1 from "./marks/1_1.png";
import mark_1_2 from "./marks/1_2.png";
import mark_1_3 from "./marks/1_3.png";
import mark_2_1 from "./marks/2_1.png";
import mark_2_2 from "./marks/2_2.png";
import InteractiveMap from "./InteractiveMap";
import type { StaticImageData } from "next/image";
import Link from "next/link";
// import useGameDialog from "../../components/GameDialog";
// import usePreloadGameDialogImgs from "../../components/GameDialog/usePreloadGameDialogImgs";
import displayError from "@/utils/displayError";
import usePreloadImgs from "@/utils/usePreloadImgs";
import useStateObj, { useStateObjExt } from "@/utils/useStateObj";
import { useTitle } from "@/utils/useTtile";
import Spinner from "@/components/Spinner";
import Textbox from "@mCmps/Textbox";
import StyledWindow from "@mCmps/StyledWindow";
import { useMutationOpenQuest, useQuests, type Quest } from "@/api/quest";

export default function Page()
{
	useTitle("Карта");
	// usePreloadGameDialogImgs();
	usePreloadImgs(map1, map2, map3, mark_0, mark_1_1, mark_1_2, mark_1_3, mark_2_1, mark_2_2);
	// const dialog = useGameDialog();
	const dialog = { run: (...a: unknown[]) => { throw new Error("Not Implemented"); }, el: () => { } };
	const mutationOpen = useMutationOpenQuest();
	const openedQuest = useStateObjExt<Quest | null>(null, v =>
	{
		if (v && v.dialogId != null && !v.opened)
			dialog.run(v.dialogId, () =>
			{
				mutationOpen.mutate(v.id);
				v.opened = true;
			});
	});
	const quests = useQuests();
	const map = useStateObj(0, () => openedQuest.set(null));

	function questMark(id: number, img: StaticImageData, x: number, y: number, w: number, h: number)
	{
		if (!quests.isSuccess) return null;
		const quest = quests.data.find(v => v.id == id);
		if (!quest || quest.completed) return null;
		return {
			img, x, y, w, h,
			onClick: () => openedQuest.set(quest),
		}
	}
	// function questMarkDepends(dependsOnId: number, id: number, img: StaticImageData, x: number, y: number, w: number, h: number)
	// {
	// 	if (!quests.isSuccess) return null;
	// 	const questDepends = quests.data.find(v => v.id == dependsOnId);
	// 	if (!questDepends?.completed) return null;
	// 	const quest = quests.data.find(v => v.id == id);
	// 	if (!quest || quest.completed) return null;
	// 	return {
	// 		img, x, y, w, h,
	// 		onClick: () => openedQuest.set(quest),
	// 	}
	// }

	return (<>
		{dialog.el()}
		{/* <GameDialogGreetings /> */}
		{quests.isLoading && <Spinner />}
		<StyledWindow className={styles.window} onClose={() => openedQuest.set(null)}>
			{displayError(quests)}
			<div className={styles.map} style={{ display: openedQuest.v ? "none" : "" }}>
				<InteractiveMap
					img={[map1, map2, map3][map.v]}
					imgW={[2366, 2366, 1971][map.v]}
					imgH={[2560, 2560, 1841][map.v]}
					zoomMin={1}
					disablePadding
					fillOnStart
					// objectsOpacity={0.5}
					objects={quests.isSuccess ? [[
						questMark(1, mark_0, 1.4, 1.7, 13, 9.8),
						questMark(2, mark_1_1, 22.8, 38.4, 10.8, 9.6),
						questMark(3, mark_1_2, 49.7, 42.3, 10.9, 9.7),
						questMark(4, mark_1_3, 31.7, 80.8, 10.9, 9.7),
					], [
						questMark(1, mark_0, 1.4, 1.7, 13, 9.8),
						questMark(5, mark_2_1, 82.4, 9.2, 16.1, 10.3),
						questMark(6, mark_2_2, 48.1, 21.5, 20.7, 10),
					], [], []][map.v] : []}
				/>
			</div>
			{openedQuest.v &&
				<div className={styles.quest}>
					<Textbox small btn className={styles.quest__back}>
						<button className={"clearBtn"} onClick={() => openedQuest.set(null)}>назад</button>
					</Textbox>
					<div className={styles.quest__title}>
						<span>{openedQuest.v.name}</span>
						<span>{openedQuest.v.reward} М</span>
					</div>
					<Textbox small>
						<div className={styles.quest__description}>{openedQuest.v.description || "Нет описания"}</div>
					</Textbox>
					{openedQuest.v.dialogId != null &&
						<Textbox small btn>
							<button
								className={styles.quest__dialog}
								onClick={() => openedQuest.v && openedQuest.v.dialogId != null && dialog.run(openedQuest.v.dialogId)}
							>Вступление</button>
						</Textbox>
					}
					<div className={styles.quest__spacer}></div>
					<Textbox small btn className={styles.quest__scanner}>
						<Link href="/scanner" className={styles.quest__scanner__link}>
							<div className="title">Сдать</div>
						</Link>
					</Textbox>
				</div>}
		</StyledWindow>
		<div className={styles.btns}>
			<Textbox small btn highlight={map.v == 0}>
				<button onClick={() => map.set(0)} className={styles.btn}>Этаж 1</button>
			</Textbox>
			<Textbox small btn highlight={map.v == 1}>
				<button onClick={() => map.set(1)} className={styles.btn}>Этаж 2</button>
			</Textbox>
			<Textbox small btn highlight={map.v == 2}>
				<button onClick={() => map.set(2)} className={styles.btn}>маркет</button>
			</Textbox>
		</div>
	</>);
}
