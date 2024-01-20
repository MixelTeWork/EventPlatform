import { Link } from "react-router-dom";
import Layout from "../../components/Layout"
import styles from "./styles.module.css"
import { useHasPermission } from "../../api/operations";

export default function WorkerPage()
{
	return (
		<Layout centered gap="0.5rem">
			{useHasPermission("page_scanner_quest") && <Link to={"/scanner_quest"} className={styles.btn}>Для квестовиков</Link>}
			{useHasPermission("page_scanner_store") && <Link to={"/scanner_store"} className={styles.btn}>Для продавцов</Link>}
		</Layout>
	);
}
