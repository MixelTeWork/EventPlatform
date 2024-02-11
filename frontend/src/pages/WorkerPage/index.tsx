import { Link } from "react-router-dom";
import Layout from "../../components/Layout"
import styles from "./styles.module.css"
import { useHasPermission } from "../../api/operations";

export default function WorkerPage()
{
	return (
		<Layout centered gap="0.8rem">
			{useHasPermission("manage_store") && <Link to={"/manage_store"} className={styles.btn}>Управление магазином</Link>}
			{useHasPermission("manage_quest") && <Link to={"/manage_quest"} className={styles.btn}>Управление квестами</Link>}
			{useHasPermission("page_scanner_quest") && <Link to={"/scanner_quest"} className={styles.btn}>Для квестовиков</Link>}
			{useHasPermission("page_scanner_store") && <Link to={"/scanner_store"} className={styles.btn}>Для продавцов</Link>}
			{useHasPermission("promote_worker") && <Link to={"/promote_worker"} className={styles.btn}>Повысить до волонтёра</Link>}
			{useHasPermission("promote_manager") && <Link to={"/promote_manager"} className={styles.btn}>Повысить до управляющего</Link>}
		</Layout>
	);
}
