import { Link } from "react-router-dom";
import useQuests from "../../api/quest";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"

export default function ScannerSelectQuestPage()
{
	const quests = useQuests();

	return (
		<Layout centered gap="1rem" className={styles.root}>
			{quests.isLoading && <Spinner />}
			{displayError(quests)}
			<h2>Какой квест вы проводите?</h2>
			<div className={styles.quests}>
				{quests.data?.map(quest =>
					<Link to={"/scanner_quest/" + quest.id} key={quest.id}>
						{quest.name}
					</Link>
				)}
			</div>
		</Layout>
	);
}
