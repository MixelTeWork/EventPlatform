import { useEffect, useState } from "react";
import Layout from "../../components/Layout"
import useScanner from "../../utils/useScanner";
import styles from "./styles.module.css"
import { useParams } from "react-router-dom";
import useQuests, { useMutationCompleteQuest } from "../../api/quest";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";

export default function ScannerQuestPage()
{
	const urlParams = useParams();
	const [msg, setMsg] = useState("");
	const questId = parseInt(urlParams["questId"]!, 10);
	const { scanned, scanner } = useScanner();
	const quests = useQuests();
	const completeQuest = useMutationCompleteQuest(r =>
	{
		setMsg(r.res);
		setTimeout(() => completeQuest.reset(), 1000);
	});
	// reset after error

	useEffect(() =>
	{
		if (scanned == "" || !completeQuest.isIdle) return;
		const userId = parseInt(scanned.slice("user_".length), 10);
		if (isNaN(userId))
		{
			setMsg("Игрок не опознан");
			return;
		}
		completeQuest.mutate({ userId, questId });
	}, [scanned])

	return (
		<Layout className={styles.root}>
			{quests.isLoading && <Spinner />}
			{completeQuest.isLoading && <Spinner />}
			<div className={styles.title}>
				<h2>{quests.data?.find(quest => quest.id == questId)?.name}</h2>
				<h3>Просканируйте qr-код посетителя, чтобы засчитать ему этот квест.</h3>
				{displayError(quests)}
			</div>
			{scanner}
			<div className={styles.bottom}>
				<h2>{msg}</h2>
				{displayError(completeQuest)}
			</div>
		</Layout>
	);
}
