import styles from "./styles.module.css"
import timetable from "./timetable.png";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";

export default function TimetablePage()
{
	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="timetable" />}>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.map}>
				<img src={timetable} alt="Расписание" />
			</div>
		</Layout>
	);
}
