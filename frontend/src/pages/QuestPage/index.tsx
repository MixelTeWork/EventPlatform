import { useQuests, type Quest } from "../../api/quest";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import items from "./items.png"
import btn from "./btn.png"
import styles from "./styles.module.css"
import StyledWindow from "../../components/StyledWindow";
import useStateObj from "../../utils/useStateObj";
import { Link } from "react-router-dom";
import { useTitle } from "../../utils/useTtile";
import classNames from "../../utils/classNames";

export default function QuestPage()
{
	useTitle("Квесты");
	const openQuest = useStateObj<Quest | null>(null);
	const quests = useQuests();

	return (
		<Layout centeredPage headerColor="#545f82" gap="1em" className={styles.root} footer={<Footer curPage="quest" />}>
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			{quests.isLoading && <Spinner />}
			<StyledWindow
				className={styles.body}
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
	}
]

function renderReward(reward: number)
{
	if (!isFinite(reward)) return "∞";
	return reward + "G";
}
