import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"
import banner from "./banner.png"
import press from "./press.png"
import useStateObj from "../../utils/useStateObj";
import { useGameState, useMutationSendClick } from "../../api/game";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import useUser from "../../api/user";


export default function GamePage()
{
	useTitle("Игра");
	const user = useUser();
	const state = useGameState();
	const counter = useStateObj(0);
	const clicks = useStateObj(0);
	const lastClickSend = useStateObj(Date.now());
	const sendClick = useMutationSendClick();

	useEffect(() =>
	{
		if (state.isFetching) return;
		if (state.data?.state == "going") return;

		const t = setTimeout(() => state.refetch(), 5000);

		return () => clearTimeout(t);
		// eslint-disable-next-line
	}, [state.isFetching])

	useEffect(() =>
	{
		if (!state.data) return;
		counter.set(state.data.counter);
		if (state.data.counter < 0) return;
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
		// eslint-disable-next-line
	}, [state.data])

	useEffect(() =>
	{
		if (state.data?.state != "going") return;
		if (clicks.v <= 0 || sendClick.isLoading) return;
		if (Date.now() - lastClickSend.v < 2500) return;

		sendClick.mutate(clicks.v);
		lastClickSend.set(Date.now())
		clicks.set(0);
		// eslint-disable-next-line
	}, [clicks.v]);

	return (
		<Layout centeredPage headerColor="#512d00" gap="1em" className={styles.root} footer={<Footer curPage="game" />}>
			<div className={styles.background}></div>
			{state.isLoading && <Spinner />}
			{displayError(state)}
			{(state.isLoading || state.data?.state == "wait") && <>
				<div className={styles.snail5}></div>
				<div className={styles.snail6}></div>
				<div className={styles.ghost}></div>
				<h1 className={styles.title}>Underparty</h1>
				<div className={styles.text}>
					<div className={styles.snail4}>
						<span className={styles.snail1}>Для</span>
						<span> участия </span>
						<span className={styles.snail2}>в</span>
						<span> игре приходите на </span>
						<span className={styles.yellow}>Главную&nbsp;&nbsp;сцену</span>
						{state.data?.start && <>
							<span> в </span>
							<span className={classNames(styles.yellow, styles.snail3)}>{state.data.start}</span>
						</>}
					</div>
				</div>
			</>}
			{state.data?.state == "start" && <>
				<div className={styles.snail2_2}></div>
				<div className={styles.snail6}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>{user.data?.group == 1 ? "Сапожник" : "Кактус"}</h1>
				<img src={banner} alt="Игра" />
				<h2 className={styles.subtitle}>Дождитесь начала</h2>
				<h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1>
				<div className={styles.snails}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</>}
			{state.data?.state == "going" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>{user.data?.group == 1 ? "Сапожник" : "Кактус"}</h1>
				<h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1>
				{/* <h1 className={styles.title}>{clicks.v}</h1> */}
				<div className={styles.press}>
					<button
						onClick={e =>
						{
							animateBtnPress(e.target as HTMLElement);
							clicks.set(v => v + 1);
						}}
					>
						<img src={press} alt="Жми!" />
					</button>
				</div>
			</>}
			{state.data?.state == "end" && <>
				<div className={styles.snail2_2}></div>
				<h1 className={styles.title}>Underparty</h1>
				<h1 className={styles.title}>{user.data?.group == 1 ? "Сапожник" : "Кактус"}</h1>
				{state.data.winner == 0 ? <h1>Игра завершена!</h1> : <>
					<h1 className={styles.title}>{user.data?.group == state.data.winner ? "Победа!" : "Проигрыш!"}</h1>
					{user.data?.group != state.data.winner && <h2 className={styles.subtitle}>Повезёт в следующий раз</h2>}
				</>}
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