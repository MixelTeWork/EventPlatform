import Layout from "../../components/Layout"
import styles from "./styles.module.css"
import { useParams } from "react-router-dom";
import { useQuests, useMutationCompleteQuest } from "../../api/quest";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import Scanner from "../../components/Scanner";

export default function ScannerQuestPage()
{
	const urlParams = useParams();
	const questId = parseInt(urlParams["questId"]!, 10);
	const quests = useQuests();

	return (
		<Layout className={styles.root}>
			{quests.isLoading && <Spinner />}

			<div className={styles.title}>
				<h2>{quests.data?.find(quest => quest.id == questId)?.name}</h2>
				<h3>Просканируйте qr-код посетителя, чтобы засчитать ему этот квест.</h3>
				{displayError(quests)}
			</div>

			<Scanner
				useMutation={useMutationCompleteQuest}
				onScan={scanned =>
				{
					if (!scanned.startsWith("user_"))
						return null;
					const userId = parseInt(scanned.slice("user_".length), 10);
					if (isNaN(userId))
						return null;
					return { userId, questId };
				}}
				formatMsg={r => ({
					"ok": `Квест зачтён для ${r.player}`,
					"already_done": `${r.player} уже проходил этот квест`,
					"no_player": "Посетитель не найден",
				}[r.res] || r.res)}
			/>
		</Layout>
	);
}
