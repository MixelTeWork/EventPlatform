import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import IconCancel from "../../icons/cancel";
import IconSave from "../../icons/save";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";

export default function RaceSettingsPage()
{
	const startTime = useStateObj("00:00")
	const counter = useStateObj("00:00")

	return (
		<Layout centeredPage homeBtn gap="1rem">
			<h1>Настройки гонок</h1>
			<Link to="/race_screen" className={styles.openScreen}>Открыть экран</Link>
			<div className={styles.input}>
				<span>Время начала (чч:мм)</span>
				<input type="text" value={startTime.v} onChange={e => startTime.set(e.target.value)} />
				<button><IconSave /></button>
				<button><IconCancel /></button>
			</div>
			<div className={styles.input}>
				<span>Обратный отсчёт (мм:сс)</span>
				<input type="text" value={counter.v} onChange={e => counter.set(e.target.value)} />
				<button><IconSave /></button>
				<button><IconCancel /></button>
			</div>
			<button className={styles.start}>Старт!</button>
		</Layout>
	);
}
