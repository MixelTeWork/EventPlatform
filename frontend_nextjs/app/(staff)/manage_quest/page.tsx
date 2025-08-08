"use client"
import styles from "./page.module.css"
import { useTitle } from "@/utils/useTtile";
import useSecuredPage from "@/utils/useSecuredPage";
import displayError from "@/utils/displayError";
import usePreloadGameDialogImgs from "@/components/GameDialog/usePreloadGameDialogImgs";
import Spinner from "@/components/Spinner";
import { useQuestsFull } from "@/api/quest";
import Quest from "./Quest";
import AddQuest from "./AddQuest";
import EditDialogButton from "./EditDialogButton";

const STARTDIALOGID = 1;
const GAMEDIALOGID = 2;

export default function Page()
{
	useTitle("Квесты");
	useSecuredPage("manage_quest");
	usePreloadGameDialogImgs();
	const quests = useQuestsFull();

	return (<>
		{quests.isLoading && <Spinner />}
		{displayError(quests)}

		<h1>Управление квестами</h1>

		<AddQuest />
		<EditDialogButton DIALOGID={STARTDIALOGID} text="Стартовый диалог" />
		<EditDialogButton DIALOGID={GAMEDIALOGID} text="Диалог перед игрой" />

		<div className={styles.quests}>
			{quests.data?.map(quest => <Quest key={quest.id} quest={quest} />)}
		</div>
	</>);
}
