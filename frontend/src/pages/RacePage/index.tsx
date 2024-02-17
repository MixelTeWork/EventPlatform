import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"

export default function RacePage()
{
	useTitle("Гонки");

	return (
		<Layout centeredPage headerColor="#512d00" gap="1em" className={styles.root} footer={<Footer curPage="race" />}>
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.text}>
				<div>
					<span>Для участия в гонке приходите на </span>
					<span className={styles.yellow}>Главную&nbsp;&nbsp;сцену</span>
					<span> в </span>
					<span className={styles.yellow}>16:30</span>
				</div>
			</div>
		</Layout>
	);
}
