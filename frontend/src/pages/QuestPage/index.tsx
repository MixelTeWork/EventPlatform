import { useMutationOpenQuest, useQuests, type Quest } from "../../api/quest";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import items from "./items.png"
import btn from "./btn.png"
import styles from "./styles.module.css"
import StyledWindow from "../../components/StyledWindow";
import { useStateObjExt } from "../../utils/useStateObj";
import { Link } from "react-router-dom";
import { useTitle } from "../../utils/useTtile";
import classNames from "../../utils/classNames";
import useGameDialog from "../../components/GameDialog";

export default function QuestPage()
{
	useTitle("Квесты");
	const dialog = useGameDialog();
	const mutationOpen = useMutationOpenQuest();
	const openQuest = useStateObjExt<Quest | null>(null, v =>
	{
		if (v && v.dialogId != null && !v.opened)
			dialog.run(v.dialogId, () =>
			{
				mutationOpen.mutate(v.id);
				v.opened = true;
			});
	});
	const quests = useQuests();

	return (
		<Layout centeredPage headerColor="#545f82" gap="1em" className={styles.root} footer={<Footer curPage="quest" />}>
			{dialog.el()}
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			{quests.isLoading && <Spinner />}
			<div className={styles.body}>
				<StyledWindow
					className={styles.window}
					title="Квесты"
					footer={<img className={styles.items} src={items} alt="" />}
					onClose={() => openQuest.set(null)}
				>
					{openQuest.v ?
						<div className={styles.questDescription}>
							<button
								className={classNames(styles.quest, openQuest.v.completed && styles.quest_completed)}
								key={openQuest.v.id}
								onClick={() => openQuest.set(null)}
							>
								<span>{openQuest.v.name}</span>
								<span>{renderReward(openQuest.v.reward)}</span>
							</button>
							{openQuest.v && openQuest.v.dialogId != null ?
								<button onClick={() => openQuest.v && openQuest.v.dialogId != null && dialog.run(openQuest.v.dialogId)}>Вступление</button>
								:
								<div></div>
							}
							<div className={styles.questDescription__body}>{openQuest.v.description || "Нет описания"}</div>
							<Link to="/scanner" className={styles.btn}>
								<img src={btn} alt="Сдать" />
							</Link>
						</div>
						:
						<div className={styles.quests}>
							{displayError(quests)}
							{quests.data && (fakeQuests.concat(quests.data)).map(quest =>
								<button
									className={classNames(styles.quest, quest.completed && styles.quest_completed)}
									key={quest.id}
									onClick={() => openQuest.set(quest)}
								>
									<span>{quest.name}</span>
									<span>{renderReward(quest.reward)}</span>
								</button>
							)}
						</div>}
				</StyledWindow>
				{!openQuest.v ?
					<Link to="/scanner" className={styles.btn}>
						<img src={btn} alt="Сдать" />
					</Link>
					: <div className={styles.btn_empty}></div>
				}
			</div>
		</Layout>
	);
}

const fakeQuests: Quest[] = [
	{
		id: -1,
		name: "Барахолка",
		description: "Сдайте одно [БАРАХЛО], чтобы обменять его на другое [БАРАХЛО] или виртуальную валюту GGG!",
		reward: Infinity,
		completed: false,
		dialogId: -1,
		opened: false,
	}
]

function renderReward(reward: number)
{
	if (!isFinite(reward)) return "∞";
	return reward + "G";
}
