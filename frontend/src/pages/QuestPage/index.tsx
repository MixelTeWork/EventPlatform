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

export default function QuestPage()
{
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
						<div className={styles.quest} onClick={() => openQuest.set(null)}>
							<span>{openQuest.v.name}</span>
							{user.data?.complited_quests.includes(openQuest.v.id) ?
								<span className="material_symbols">done</span>
								:
								<span>{openQuest.v.reward}G</span>
							}
						</div>
						<div>{openQuest.v.description || "Нет описания"}</div>
						<Link to="/scanner" className={styles.btn}>
							<img src={btn} alt="Сдать" />
						</Link>
					</div>
					:
					<div className={styles.quests}>
						{displayError(quests)}
						{quests.data?.map(quest =>
							<button className={styles.quest} key={quest.id} onClick={() => openQuest.set(quest)}>
								<span>{quest.name}</span>
								{user.data?.complited_quests.includes(quest.id) ?
									<span className="material_symbols">done</span>
									:
									<span>{quest.reward}G</span>
								}
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
