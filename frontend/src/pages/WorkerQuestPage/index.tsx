import { Link } from "react-router-dom";
import { useQuests, type Quest } from "../../api/quest";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"
import Popup from "../../components/Popup";
import QrCode from "../../components/QrCode";
import useStateObj from "../../utils/useStateObj";
import useStateBool from "../../utils/useStateBool";

export default function WorkerQuestPage()
{
	const quests = useQuests();
	const popupOpen = useStateBool(false);
	const selectedQuest = useStateObj<Quest | null>(null, popupOpen.setT);

	return (
		<Layout centered gap="1rem" height100 className={styles.root}>
			{quests.isLoading && <Spinner />}
			{displayError(quests)}
			<h2>Какой квест вы проводите?</h2>
			<div className={styles.quests}>
				{quests.data?.map(quest =>
					<button key={quest.id} onClick={() => selectedQuest.set(quest)}>
						{quest.name}
					</button>
				)}
			</div>
			<Popup title="Код квеста" open={popupOpen.v} close={popupOpen.setF}>
				<div className={styles.qr}>
					<QrCode code={`quest_${selectedQuest.v?.id}`} colorBg="#ffffff00" scale={13} />
				</div>
				<div className={styles.quest}>
					<div>{selectedQuest.v?.name}</div>
					<div>{selectedQuest.v?.reward} G</div>
				</div>
				<h3>QR-код для зачёта квеста</h3>
			</Popup>
		</Layout>
	);
}