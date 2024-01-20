import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import styles from "./styles.module.css"

export default function QuestPage()
{
	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="quest" />}>
			<div>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.quests}>
					{new Array(10).fill(0).map((_, i) =>
						<div className={styles.quest} key={i}>
							<span>Квест {i + 1}</span>
							{i % 3 == 2 ?
								<span className="material_symbols">done</span>
								:
								<span>{(i + 1) * 2343 % 150 + 50}G</span>
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
