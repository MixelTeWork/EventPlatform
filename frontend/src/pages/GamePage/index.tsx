import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";
import { useGameState, useMutationGameSelectTeam, useMutationSendClick } from "../../api/game";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import StyledWindow from "../../components/StyledWindow";
import { useDisableZoom } from "../../utils/useDisableZoom";
import randomInt from "../../utils/randomInt";
import GameDialogGame from "../../components/GameDialogGame";
import { useTourneyCharacters } from "../../api/tourney";
import { characterById } from "../../api/tourney";
import Title from "../../components/Title";
import Textbox from "../../components/Textbox";


export default function GamePage()
{
	useTitle("Игра");
	useDisableZoom();
	const state = useGameState();
	const characters = useTourneyCharacters();
	const counter = useStateObj(0);
	const clicks = useStateObj(0);
	const sendDelay = useStateObj(0);
	const lastClickSend = useStateObj(Date.now());
	const sendClick = useMutationSendClick(() => lastClickSend.set(Date.now()), () => lastClickSend.set(Date.now()));
	const selectTeam = useMutationGameSelectTeam();

	const characterLeft = characterById(characters.data, state.data?.opponent1Id);
	const characterRight = characterById(characters.data, state.data?.opponent2Id);
	const characterWinner = state.data?.winner == 1 ? characterLeft : state.data?.winner == 2 ? characterRight : null;
	const characterTeam = state.data?.team == 1 ? characterLeft : state.data?.team == 2 ? characterRight : null;

	const characterTourneyWinner1 = characterById(characters.data, state.data?.tourneyWinner1);
	const characterTourneyWinner2 = characterById(characters.data, state.data?.tourneyWinner2);
	const characterTourneyWinner3 = characterById(characters.data, state.data?.tourneyWinner3);

	useEffect(() =>
	{
		if (state.isFetching) return;
		if (state.data?.state == "going") return;

		if (clicks.v != 0) clicks.set(0);
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

		const t = setInterval(() =>
		{
			state.refetch();
		}, 5000);
		const ct = () => clearInterval(t);

		if (clicks.v <= 0 || sendClick.isLoading) return ct;
		if (Date.now() - lastClickSend.v < sendDelay.v) return ct;

		sendClick.mutate(clicks.v);
		clicks.set(0);
		sendDelay.set(randomInt(1000, 3000));
		return ct;
		// eslint-disable-next-line
	}, [clicks.v, state.data?.state]);

	return (<>
		{state.data?.state == "start" && <GameDialogGame />}
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="game" />}>
			<Title className={styles.title} />
			{state.isLoading && <Spinner />}
			{displayError(state)}
			{selectTeam.isLoading && <Spinner />}
			{displayError(selectTeam)}
			<StyledWindow className={styles.window}>
				{(state.isLoading || state.data?.state == "wait") && <>
					<div className={styles.text}>
						<div>
							<span>Чтобы увидеть и повлиять на концовку истории приходите на сцену</span>
							{state.data?.start && <span> в {state.data.start}</span>}
						</div>
					</div>
				</>}
				{state.data?.team == 0 && (state.data?.state == "start" || state.data?.state == "going") ? <>
					<div className={styles.text}>
						<div className={styles.title2}>Победить должен</div>
						<div className={styles.chooseTeam}>
							<Textbox small btn className={styles.chooseTeam__btn}>
								<button className="clearBtn" onClick={() => selectTeam.mutate(1)}>{characterLeft?.name || "N/A"}</button>
							</Textbox>
							<Textbox small btn className={styles.chooseTeam__btn}>
								<button className="clearBtn" onClick={() => selectTeam.mutate(2)}>{characterRight?.name || "N/A"}</button>
							</Textbox>
						</div>
					</div>
				</> : <>
					{state.data?.state == "start" && <>
						<div className={styles.text}>
							<div className={styles.title2}>{characterTeam?.name || "N/A"} победит!</div>
							<h2 className={styles.subtitle}>Дождитесь начала</h2>
							<h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1>
						</div>
					</>}
					{state.data?.state == "going" && <button
						className={classNames(styles.press, "clearBtn")}
						onClick={e =>
						{
							animateBtnPress(e.target as HTMLElement);
							clicks.set(v => v + 1);
						}}
					>
						<h1 className={styles.title2}>{characterTeam?.name || "N/A"} победит!</h1>
						{/* <h1 className={styles.title}>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</h1> */}
						{/* <h1 className={styles.title}>{clicks.v}</h1> */}
						<div className={styles.press__btn}>Жми!!!</div>
					</button>}
				</>}
				{state.data?.state == "end" && <>
					<div className={styles.text}>
						<div className={styles.title2}>{characterWinner?.name || "..."} побеждает!</div>
						<h1 className={styles.title3}>
							{state.data.winner == 0 ? "Игра завершена!" :
								state.data.team == state.data.winner ? "Победа!" : "Проигрыш!"}
						</h1>
					</div>
				</>}
				{state.data?.state == "tourneyEnd" && <>
					<div className={styles.text}>
						<div className={styles.title2}>Турнир завершён!</div>
						<div className={styles.tourney_winners}>
							<Textbox small className={styles.tourney_winner}>
								<img src={characterTourneyWinner1?.img} alt={characterTourneyWinner1?.name || "N/A"} />
								<div>1 место</div>
								<div>{characterTourneyWinner1?.name || "N/A"}</div>
							</Textbox>
							<Textbox small className={styles.tourney_winner}>
								<img src={characterTourneyWinner2?.img} alt={characterTourneyWinner2?.name || "N/A"} />
								<div>2 место</div>
								<div>{characterTourneyWinner2?.name || "N/A"}</div>
							</Textbox>
							<Textbox small className={styles.tourney_winner}>
								<img src={characterTourneyWinner3?.img} alt={characterTourneyWinner3?.name || "N/A"} />
								<div>3 место</div>
								<div>{characterTourneyWinner3?.name || "N/A"}</div>
							</Textbox>
						</div>
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