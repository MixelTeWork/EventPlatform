import { useState } from "react";
import { useQuests, type Quest } from "../../api/quest";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import items from "./items.png"
import btn from "./btn.png"
import styles from "./styles.module.css"
import useUser, { useUpdateUser } from "../../api/user";
import Popup from "../../components/Popup";
import QrCode from "../../components/QrCode";
import StyledWindow from "../../components/StyledWindow";
import useStateObj from "../../utils/useStateObj";
import { Link } from "react-router-dom";
import { useTitle } from "../../utils/useTtile";
import classNames from "../../utils/classNames";

export default function QuestPage()
{
	useTitle("Квесты");
	const user = useUser();
	const updateUser = useUpdateUser();
	const openQuest = useStateObj<Quest | null>(null);
	const [popupIsOpen, setPopupIsOpen] = useState(false);
	const quests = useQuests();

	return (
		<Layout centeredPage headerColor="#545f82" gap="1em" className={styles.root} footer={<Footer curPage="quest" />}>
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			{quests.isLoading && <Spinner />}
			{user.isFetching && <Spinner />}
			<StyledWindow
				className={styles.body}
				title="Квесты"
				footer={<img className={styles.items} src={items} alt="" />}
				onClose={() => openQuest.set(null)}
			>
				{openQuest.v ?
					<div className={styles.questDescription}>
						<button
							className={classNames(styles.quest, user.data?.complited_quests.includes(openQuest.v.id) && styles.quest_completed)}
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
								className={classNames(styles.quest, user.data?.complited_quests.includes(quest.id) && styles.quest_completed)}
								key={quest.id}
								onClick={() => openQuest.set(quest)}
							>
								<span>{quest.name}</span>
								<span>{renderReward(quest.reward)}</span>
							</button>
						)}
					</div>}
			</StyledWindow>
			<Popup title="Завершение квеста" open={popupIsOpen} close={() =>
			{
				setPopupIsOpen(false);
				if (user.data?.auth)
					updateUser();
			}}>
				{user?.data?.auth ?
					<>
						<QrCode code={`user_${user.data.id}`} colorBg="#ffffff00" scale={13} />
						<h3>Покажите qr-код квестовику</h3>
					</> : <>
						<p>Для прохождения квестов необходимо войти в систему.</p>
						<p>Кнопка входа находиться в правом верхнем углу.</p>
					</>
				}
			</Popup>
		</Layout>
	);
}

const fakeQuests: Quest[] = [
	{
		id: -1,
		name: "Барахолка",
		description: "Сдайте одно [БАРАХЛО], чтобы обменять его на другое [БАРАХЛО] или виртуальную валюту GGG!",
		reward: Infinity,
	}
]

function renderReward(reward: number)
{
	if (!isFinite(reward)) return "∞";
	return reward + "G";
}
