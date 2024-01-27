import { useState } from "react";
import { useQuests, useUpdateQuests } from "../../api/quest";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"
import useUser from "../../api/user";
import Popup from "../../components/Popup";
import QrCode from "../../components/QrCode";

export default function QuestPage()
{
	const user = useUser();
	const updateQuests = useUpdateQuests();
	const [popupIsOpen, setPopupIsOpen] = useState(false);
	const quests = useQuests();

	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="quest" />}>
			{quests.isFetching && <Spinner />}
			<div className={styles.body}>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.quests}>
					{displayError(quests)}
					{quests?.data?.map(quest =>
						<div className={styles.quest} key={quest.id}>
							<span>{quest.name}</span>
							{quest.completed ?
								<span className="material_symbols">done</span>
								:
								<span>{quest.reward}G</span>
							}
						</div>
					)}
				</div>
			</div>
			<div className={styles.bottom}>
				<button
					className={styles.btnQr}
					onClick={() => setPopupIsOpen(true)}
				>
					Завершить квест!
				</button>
			</div>
			<Popup title="Завершение квеста" open={popupIsOpen} close={() =>
			{
				setPopupIsOpen(false);
				updateQuests();
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
