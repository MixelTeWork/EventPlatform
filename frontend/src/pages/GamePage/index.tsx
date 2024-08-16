import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";
import { useGameState, useMutationSendClick } from "../../api/game";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import useUser from "../../api/user";
import StyledWindow from "../../components/StyledWindow";
import { useDisableZoom } from "../../utils/useDisableZoom";
import randomInt from "../../utils/randomInt";
import GameDialogGame from "../../components/GameDialogGame";


export default function GamePage()
{
	useTitle("Игра");
	useDisableZoom();
	const user = useUser();
	const state = useGameState();
	const counter = useStateObj(0);
	const clicks = useStateObj(0);
	const sendDelay = useStateObj(0);
	const lastClickSend = useStateObj(Date.now());
	const sendClick = useMutationSendClick(() => lastClickSend.set(Date.now()), () => lastClickSend.set(Date.now()));

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
		if (Date.now() - lastClickSend.v < sendDelay.v) return;

		sendClick.mutate(clicks.v);
		clicks.set(0);
		sendDelay.set(randomInt(1000, 3000));
		// eslint-disable-next-line
	}, [clicks.v]);

	return (<>
		{state.data?.state == "start" && <GameDialogGame />}
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="game" />}>
			{state.isLoading && <Spinner />}
			{displayError(state)}
			<h1 className={classNames("title", styles.title)}>Индикон</h1>
			<StyledWindow className={styles.window}>
				{(state.isLoading || state.data?.state == "wait") && <>
					<div className={styles.text}>
						<div>
							<span>Чтобы увидеть и повлиять на концовку истории приходите на сцену</span>
							{state.data?.start && <span> в {state.data.start}</span>}
						</div>
					</div>
				</>}
				{state.data?.state == "start" && <>
					<div className={styles.text}>
						<div className={styles.title2}>Персонажи должны {user.data?.group == 1 ? "вернуться" : "остаться"}</div>
						<h2 className={styles.subtitle}>Дождитесь начала</h2>
						<h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1>
					</div>
				</>}
				{state.data?.state == "going" && <button
					className={styles.press}
					onClick={e =>
					{
						animateBtnPress(e.target as HTMLElement);
						clicks.set(v => v + 1);
					}}
				>
					<h1 className={styles.title2}>Персонажи должны {user.data?.group == 1 ? "вернуться" : "остаться"}</h1>
					{/* <h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1> */}
					{/* <h1 className={styles.title}>{clicks.v}</h1> */}
					<div className={classNames("title", styles.press__btn)}>Жми!!!</div>
				</button>}
				{state.data?.state == "end" && <>
					<div className={styles.text}>
						<div className={styles.title2}>Персонажи должны {state.data.winner == 1 ? "вернуться" : "остаться"}</div>
						<h1 className={styles.title3}>
							{state.data.winner == 0 ? "Игра завершена!" :
								user.data?.group == state.data.winner ? "Победа!" : "Проигрыш!"}
						</h1>
					</div>
				</>}
			</StyledWindow>
		</Layout>
	</>);
}

function animateBtnPress(el: HTMLElement)
{
	const btn = (el instanceof HTMLButtonElement ? el : el.parentElement) as HTMLButtonElement;

	const circle = document.createElement("div");
	btn.appendChild(circle);
	circle.classList.add(styles.circle)

	setTimeout(() => btn.removeChild(circle), 1000);
}