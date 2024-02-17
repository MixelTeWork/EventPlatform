import { Link } from "react-router-dom";
import Layout from "../../components/Layout"
import styles from "./styles.module.css"
import { useHasPermission } from "../../api/operations";

export default function WorkerPage()
{
	return (
		<Layout centered homeBtn gap="1rem">
			{useHasPermission("manage_store") && <Link to={"/manage_store"} className={styles.btn}>Управление магазином</Link>}
			{useHasPermission("manage_quest") && <Link to={"/manage_quest"} className={styles.btn}>Управление квестами</Link>}
			{useHasPermission("page_worker_quest") && <Link to={"/worker_quest"} className={styles.btn}>Для квестовиков</Link>}
			{useHasPermission("page_worker_store") && <Link to={"/worker_store"} className={styles.btn}>Для продавцов</Link>}
			{useHasPermission("send_any") && <Link to={"/send"} className={styles.btn}>Казначейство</Link>}
			{useHasPermission("promote_worker") && <Link to={"/promote_worker"} className={styles.btn}>Повысить до волонтёра</Link>}
			{useHasPermission("promote_manager") && <Link to={"/promote_manager"} className={styles.btn}>Повысить до управляющего</Link>}
			{useHasPermission("manage_games") && <Link to={"/race_settings"} className={styles.btn}>Гонки</Link>}
		</Layout>
	);
}
