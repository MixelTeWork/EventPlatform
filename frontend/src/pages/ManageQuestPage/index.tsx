import { useQuests } from "../../api/quest";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import AddQuest from "./AddQuest";
import Quest from "./Quest";
import styles from "./styles.module.css"

export default function ManageQuestPage()
{
	const quests = useQuests();

	return (
		<Layout centeredPage gap="0.5rem">
			{quests.isLoading && <Spinner />}
			{displayError(quests)}

			<h1>Управление квестами</h1>

			<AddQuest />

			<div className={styles.quests}>
				{quests.data?.map(quest => <Quest key={quest.id} quest={quest} />)}
			</div>
		</Layout>
	);
}
