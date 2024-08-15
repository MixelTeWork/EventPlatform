import { useQuestsFull } from "../../api/quest";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useTitle } from "../../utils/useTtile";
import AddQuest from "./AddQuest";
import EditGameDialog from "./EditGameDialog";
import EditStartDialog from "./EditStartDialog";
import Quest from "./Quest";
import styles from "./styles.module.css"

export default function ManageQuestPage()
{
	useTitle("Квесты");
	const quests = useQuestsFull();

	return (
		<Layout centeredPage gap="0.5rem" homeBtn>
			<div className="calmBack"></div>
			{quests.isLoading && <Spinner />}
			{displayError(quests)}

			<h1>Управление квестами</h1>

			<AddQuest />
			<EditStartDialog />
			<EditGameDialog />

			<div className={styles.quests}>
				{quests.data?.map(quest => <Quest key={quest.id} quest={quest} />)}
			</div>
		</Layout>
	);
}
