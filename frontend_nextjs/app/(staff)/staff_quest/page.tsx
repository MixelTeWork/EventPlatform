"use client"
import styles from "./page.module.css"
import Spinner from "@/components/Spinner";
import Popup from "@/components/Popup";
import QrCode from "@/components/QrCode";
import displayError from "@/utils/displayError";
import { useStateObjNull } from "@/utils/useStateObj";
import useStateBool from "@/utils/useStateBool";
import { useTitle } from "@/utils/useTtile";
import { useQuestsFull, type QuestFull } from "@/api/quest";
import clsx from "@/utils/clsx";
import useSecuredPage from "@/utils/useSecuredPage";

export default function Page()
{
	useTitle("Qr Квесты");
	useSecuredPage("page_staff_quest");
	const quests = useQuestsFull();
	const popupOpen = useStateBool(false);
	const selectedQuest = useStateObjNull<QuestFull>(null, popupOpen.setT);

	return (
		<div className={styles.root}>
			{quests.isLoading && <Spinner />}
			{displayError(quests)}
			<h2>Какой квест вы проводите?</h2>
			<div className={styles.quests}>
				{quests.data?.map(quest =>
					<button key={quest.id} onClick={() => selectedQuest.set(quest)} className={clsx(styles.quest, quest.hidden && styles.quest_hidden)}>
						{quest.name}
					</button>
				)}
			</div>
			<Popup title="Код квеста" openState={popupOpen}>
				<div className={styles.qr}>
					<QrCode code={`quest_${selectedQuest.v?.id_big}`} colorBg="#ffffff00" scale={13} />
				</div>
				<div className={styles.questCard}>
					<div>{selectedQuest.v?.name}</div>
					<div>{selectedQuest.v?.reward} G</div>
				</div>
				<h3>QR-код для зачёта квеста</h3>
			</Popup>
		</div>
	);
}
