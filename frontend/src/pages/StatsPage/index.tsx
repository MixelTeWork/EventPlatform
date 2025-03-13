import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"
import { useTitle } from "../../utils/useTtile";
import { useStats, useStatsCacheClear } from "../../api/other";

export default function StatsPage()
{
	useTitle("Статистика");
	const stats = useStats();
	const clearCache = useStatsCacheClear();

	return (
		<Layout centered homeBtn gap="1rem" height100 className={styles.root} forStaff>
			{stats.isLoading && <Spinner />}
			{displayError(stats)}
			<h2>Статистика</h2>
			<button disabled={stats.isFetching} className={styles.btn} onClick={() => { clearCache(); stats.refetch(); }}>Обновить</button>
			<div className={styles.groupStats}>
				<h3>Фракции</h3>
				<div>
					<h4>Группа 1</h4>
					<ul>
						<li>Участников: {stats.data?.group1_members ?? "N/A"}</li>
						<li>Всего завершено квестов: {stats.data?.group1_completed ?? "N/A"}</li>
					</ul>
				</div>
				<div>
					<h4>Группа 2</h4>
					<ul>
						<li>Участников: {stats.data?.group2_members ?? "N/A"}</li>
						<li>Всего завершено квестов: {stats.data?.group2_completed ?? "N/A"}</li>
					</ul>
				</div>
			</div>
		</Layout>
	);
}
