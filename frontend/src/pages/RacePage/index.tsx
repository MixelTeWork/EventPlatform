import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"
import banner from "./banner.png"
import ghost2 from "./ghost2.png"
import press from "./press.png"

type State = "title" | "wait" | "join" | "play" | "won" | "loss";

export default function RacePage()
{
	useTitle("Гонки");
	const state = "title" as State;

	return (
		<Layout centeredPage headerColor="#512d00" gap="1em" className={styles.root} footer={<Footer curPage="race" />}>
			<div className={styles.background}></div>
			{state == "title" && <>
				<div className={styles.snail5}></div>
				<div className={styles.snail6}></div>
				<div className={styles.ghost}></div>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.text}>
					<div className={styles.snail4}>
						<span className={styles.snail1}>Для</span>
						<span> участия </span>
						<span className={styles.snail2}>в</span>
						<span> гонке приходите на </span>
						<span className={styles.yellow}>Главную&nbsp;&nbsp;сцену</span>
						<span> в </span>
						<span className={styles.yellow}>16:</span>
						<span className={classNames(styles.yellow, styles.snail3)}>30</span>
					</div>
				</div>
			</>}
			{state == "wait" && <>
				<div className={styles.snail2_2}></div>
				<div className={styles.snail6}></div>
				<h1 className={styles.title}>Underparty</h1>
				<img src={banner} alt="Гонки улиток" />
				<h2 className={styles.subtitle}>Дождитесь начала</h2>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
			{state == "join" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>2:30</h1>
				<div className={styles.join}>
					<h2 className={styles.subtitle}>Участие</h2>
					<h2 className={classNames(styles.subtitle, styles.yellow)}>10G</h2>
					<div className={styles.join__btns}>
						<button className={styles.btn_blue}>Синий</button>
						<button className={styles.btn_red}>Красный</button>
						<img src={ghost2} alt="Призрак" />
						<button className={styles.btn_yellow}>Жёлтый</button>
						<button className={styles.btn_green}>Зелёный</button>
					</div>
					<button className={styles.joinBtn}>Принять участие</button>
				</div>
			</>}
			{state == "play" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.press}>
					<button onClick={e =>
					{
						animateBtnPress(e.target as HTMLElement);
					}}>
						<img src={press} alt="Жми!" />
					</button>
				</div>
			</>}
			{state == "won" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>Победа!</h1>
				<div>
					<h2 className={styles.subtitle}>Вы выиграли:</h2>
					<h2 className={classNames(styles.subtitle, styles.yellow)}>10G</h2>
				</div>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
			{state == "loss" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>Проигрыш!</h1>
				<h2 className={styles.subtitle}>Повезёт в следующий раз</h2>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
		</Layout>
	);
}

function animateBtnPress(el: HTMLElement)
{
	const btn = (el instanceof HTMLButtonElement ? el : el.parentElement) as HTMLButtonElement;

	const circle = document.createElement("div");
	btn.appendChild(circle);
	circle.classList.add(styles.circle)

	setTimeout(() => btn.removeChild(circle), 1000);
}