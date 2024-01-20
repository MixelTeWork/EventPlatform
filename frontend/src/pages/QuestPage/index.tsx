import useQuests from "../../api/quest";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"

export default function QuestPage()
{
	const quests = useQuests();

	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="quest" />}>
			{quests.isLoading && <Spinner />}
			<div>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.quests}>
					{displayError(quests)}
					{quests?.data?.map(quest =>
						<div className={styles.quest} key={quest.id}>
							<span>{quest.name}</span>
							{false ?
								<span className="material_symbols">done</span>
								:
								<span>{quest.reward}G</span>
							}
						</div>
					)}
				</div>
			</div>
			<div>
				<button className={styles.btnQr}>Завершить квест!</button>
			</div>
		</Layout>
	);
}
