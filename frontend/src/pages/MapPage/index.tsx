import styles from "./styles.module.css"
import map1 from "./map1.png";
import map2 from "./map2.png";
import map3 from "./map3.png";
import map4 from "./map4.png";
import map5 from "./map5.png";
import mark_mady from "./marks/mady.png";
import mark_info from "./marks/info.png";
import mark_indi from "./marks/indi.png";
import mark_game from "./marks/game.png";
import mark_stand from "./marks/stand.png";
import mark_banner from "./marks/banner.png";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import useStateObj, { useStateObjExt } from "../../utils/useStateObj";
import { useTitle } from "../../utils/useTtile";
import GameDialogGreetings from "../../components/GameDialogGreetings";
import classNames from "../../utils/classNames";
import Textbox from "../../components/Textbox";
import StyledWindow from "../../components/StyledWindow";
import InteractiveMap from "./InteractiveMap";
import useGameDialog from "../../components/GameDialog";
import { useMutationOpenQuest, useQuests, type Quest } from "../../api/quest";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { Link } from "react-router-dom";
import usePreloadGameDialogImgs from "../../components/GameDialog/usePreloadGameDialogImgs";
import usePreloadImgs from "../../utils/usePreloadImgs";

export default function MapPage()
{
	useTitle("Карта");
	usePreloadGameDialogImgs();
	usePreloadImgs(map1, map2, map3, map4, map5, mark_mady, mark_info, mark_indi, mark_game, mark_stand, mark_banner);
	const dialog = useGameDialog();
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

	function questMark(id: number, img: string, x: number, y: number, w: number, h: number)
	{
		if (!quests.isSuccess) return null;
		const quest = quests.data.find(v => v.id == id);
		if (!quest || quest.completed) return null;
		return {
			img, x, y, w, h,
			onClick: () => openedQuest.set(quest),
		}
	}
	function questMarkDepends(dependsOnId: number, id: number, img: string, x: number, y: number, w: number, h: number)
	{
		if (!quests.isSuccess) return null;
		const questDepends = quests.data.find(v => v.id == dependsOnId);
		if (!questDepends?.completed) return null;
		const quest = quests.data.find(v => v.id == id);
		if (!quest || quest.completed) return null;
		return {
			img, x, y, w, h,
			onClick: () => openedQuest.set(quest),
		}
	}

	return (
		<Layout centeredPage className={styles.root} footer={<Footer curPage="map" />}>
			{dialog.el()}
			<GameDialogGreetings />
			{quests.isLoading && <Spinner />}
			<h1 className={classNames("title", styles.title)}>Underparty</h1>
			<StyledWindow className={styles.window} onClose={() => openedQuest.set(null)}>
				{displayError(quests)}
				<div className={styles.map} style={{ display: openedQuest.v ? "none" : "" }}>
					<InteractiveMap
						img={[map1, map2, map3, map4, map5][map.v]}
						imgW={[2150, 2150, 1600, 1600, 1600][map.v]}
						imgH={[1512, 1512, 1125, 1142, 1395][map.v]}
						zoomMin={1}
						disablePadding
						fillOnStart
						// objectsOpacity={0.5}
						objects={quests.isSuccess ? [[
							questMark(1, mark_mady, 3.6, 6.9, 11.2, 14,),
							questMark(2, mark_info, 56.5, 75.3, 21.2, 17.1),
							questMarkDepends(2, 3, mark_info, 56.5, 75.3, 21.2, 17.1),
						], [
							questMark(1, mark_mady, 3.6, 6.9, 11.2, 14,),
							questMark(4, mark_indi, 4.7, 26.3, 17.9, 35.5),
							questMark(5, mark_game, 24.8, 35.4, 11.7, 20.2),
							questMark(6, mark_stand, 37.5, 49.9, 9.2, 17.4),
							questMark(7, mark_banner, 64.7, 51.5, 7, 14.8),
						], [
							questMark(1, mark_mady, 3.6, 6.9, 11.2, 14,),
						], [], []][map.v] : []}
					/>
				</div>
				{openedQuest.v &&
					<div className={styles.quest}>
						<div className={classNames("title", styles.quest__title)}>
							<span>{openedQuest.v.name}</span>
							<span>{openedQuest.v.reward}М</span>
						</div>
						<Textbox dark>
							<div className={styles.quest__description}>{openedQuest.v.description || "Нет описания"}</div>
						</Textbox>
						{openedQuest.v.dialogId != null &&
							<Textbox btn>
								<button
									className={classNames("title", styles.quest__dialog)}
									onClick={() => openedQuest.v && openedQuest.v.dialogId != null && dialog.run(openedQuest.v.dialogId)}
								>Вступление</button>
							</Textbox>
						}
						<div className={styles.quest__spacer}></div>
						<Textbox btn className={styles.quest__scanner}>
							<Link to="/scanner" className={styles.quest__scanner__link}>
								<div className="title">Сдать</div>
							</Link>
						</Textbox>
					</div>}
			</StyledWindow>
			<div className={styles.btns__block}>
				<div className={styles.btns}>
					<Textbox small btn highlight={map.v == 0}>
						<button onClick={() => map.set(0)} className={classNames(styles.btn, "title")}>Этаж 1</button>
					</Textbox>
					<Textbox small btn highlight={map.v == 1}>
						<button onClick={() => map.set(1)} className={classNames(styles.btn, "title")}>Этаж 2</button>
					</Textbox>
					<Textbox small btn highlight={map.v == 2}>
						<button onClick={() => map.set(2)} className={classNames(styles.btn, "title")}>Этаж 3</button>
					</Textbox>
				</div>
				<div className={styles.btns}>
					<Textbox small btn highlight={map.v == 3}>
						<button onClick={() => map.set(3)} className={classNames(styles.btn, "title")}>Инди</button>
					</Textbox>
					<Textbox small btn highlight={map.v == 4}>
						<button onClick={() => map.set(4)} className={classNames(styles.btn, "title")}>Маркет</button>
					</Textbox>
				</div>
			</div>
		</Layout>
	);
}
