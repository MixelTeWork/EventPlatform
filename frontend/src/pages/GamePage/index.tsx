import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"
import banner from "./banner.png"
import ghost2 from "./ghost2.png"
import press from "./press.png"
import useStateObj from "../../utils/useStateObj";
import { useGameState, type Team, useMutationGameJoin } from "../../api/game";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";


export default function GamePage()
{
	useTitle("Игра");
	const state = useGameState();
	const mutationJoin = useMutationGameJoin();
	const selectedTeam = useStateObj<Team>("");
	const counter = useStateObj(0);

	useEffect(() =>
	{
		if (state.data?.state != "title" && state.data?.state != "play" && state.data?.state != "nojoin") return;

		const t = setInterval(() => state.refetch(), 5000);

		return () => clearInterval(t);
	}, [state.data])

	useEffect(() =>
	{
		if (state.data)
		{
			counter.set(state.data.counter);
			if (state.data.counter > 0)
			{
				const t = setInterval(() =>
				{
					counter.set(v =>
					{
						v = Math.max(v - 1, 0);
						if (v == 0)
						{
							state.refetch();
							clearInterval(t);
						}
						return v;
					});
				}, 1000);
				return () => clearInterval(t);
			}
		}
		// eslint-disable-next-line
	}, [state.data])

	return (
		<Layout centeredPage headerColor="#512d00" gap="1em" className={styles.root} footer={<Footer curPage="game" />}>
			<div className={styles.background}></div>
			{state.isLoading && <Spinner />}
			{mutationJoin.isLoading && <Spinner />}
			{displayError(state)}
			{displayError(mutationJoin)}
			{(state.isLoading || state.data?.state == "title") && <>
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
						{state.data?.start && <>
							<span> в </span>
							<span className={classNames(styles.yellow, styles.snail3)}>{state.data.start}</span>
						</>}
					</div>
				</div>
			</>}
			{state.data?.state == "wait" && <>
				<div className={styles.snail2_2}></div>
				<div className={styles.snail6}></div>
				<h1 className={styles.title}>Underparty</h1>
				<img src={banner} alt="Гонки улиток" />
				<h2 className={styles.subtitle}>Дождитесь начала</h2>
				<h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
			{state.data?.state == "join" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1>
				<div className={styles.join}>
					<h2 className={styles.subtitle}>Участие</h2>
					<h2 className={classNames(styles.subtitle, styles.yellow)}>{state.data.price}G</h2>
					<div className={styles.join__btns}>
						<button
							className={classNames(styles.btn_blue, selectedTeam.v == "blue" && styles.selectedTeam)}
							onClick={() => selectedTeam.set("blue")}
						>
							Синий
						</button>
						<button
							className={classNames(styles.btn_red, selectedTeam.v == "red" && styles.selectedTeam)}
							onClick={() => selectedTeam.set("red")}
						>
							Красный
						</button>
						<div color={selectedTeam.v}>
							<img src={ghost2} alt="Призрак" />
						</div>
						<button
							className={classNames(styles.btn_yellow, selectedTeam.v == "yellow" && styles.selectedTeam)}
							onClick={() => selectedTeam.set("yellow")}
						>
							Жёлтый
						</button>
						<button
							className={classNames(styles.btn_green, selectedTeam.v == "green" && styles.selectedTeam)}
							onClick={() => selectedTeam.set("green")}
						>
							Зелёный
						</button>
					</div>
					<button className={styles.joinBtn} onClick={() =>
					{
						if (selectedTeam.v != "")
							mutationJoin.mutate(selectedTeam.v);
					}} disabled={mutationJoin.status != "idle"}>Принять участие</button>
				</div>
			</>}
			{state.data?.state == "play" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.press}>
					<button
						onClick={e =>
						{
							animateBtnPress(e.target as HTMLElement);
						}}
					>
						<img src={press} alt="Жми!" />
					</button>
				</div>
			</>}
			{state.data?.state == "nojoin" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>Игра идёт!</h1>
				<h2 className={styles.subtitle}>Вы не успели присоединиться</h2>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
			{state.data?.state == "won" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>Победа!</h1>
				<div>
					<h2 className={styles.subtitle}>Вы выиграли:</h2>
					<h2 className={classNames(styles.subtitle, styles.yellow)}>{state.data.reward || 10}G</h2>
				</div>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
			{state.data?.state == "loss" && <>
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
			{state.data?.state == "end" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>Завершено!</h1>
				<h2 className={styles.subtitle}>Поучаствуете в следующий раз</h2>
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