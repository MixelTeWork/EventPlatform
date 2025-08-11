"use client"
import styles from "./page.module.css"
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import { useTitle } from "@/utils/useTtile";
import useSecuredPage from "@/utils/useSecuredPage";
import { useStats } from "@/api/other";
import Button from "@sCmps/Button";

export default function Page()
{
	useTitle("Статистика");
	useSecuredPage("page_stats");
	const stats = useStats();

	return (
		<div className={styles.root}>
			{stats.isFetching && <Spinner />}
			{displayError(stats)}
			<h2>Статистика</h2>
			<Button text="Обновить" padding disabled={stats.isFetching} onClick={() => stats.refetch()} />
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
		</div>
	);
}
