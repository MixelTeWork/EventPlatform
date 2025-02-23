import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import IconCancel from "../../icons/cancel";
import IconSave from "../../icons/save";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";
import { useMutationGameCounter, useMutationGameDuration, useMutationGameReset, useMutationGameStart, useMutationGameStartStr, useGameCounter, useGameDuration, useGameStartStr, useGameState } from "../../api/game";
import Popup from "../../components/Popup";
import useStateBool from "../../utils/useStateBool";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import { useTitle } from "../../utils/useTtile";

export default function GameSettingsPage()
{
	useTitle("Настройки гонок");
	const state = useGameState();
	const gameDuration = useGameDuration();
	const gameCounter = useGameCounter();
	const gameStartStr = useGameStartStr();
	const mutateDuration = useMutationGameDuration();
	const mutateCounter = useMutationGameCounter();
	const mutateStartStr = useMutationGameStartStr();
	const duration = useStateObj(0);
	const counter = useStateObj(0);
	const startStr = useStateObj("");
	const popupOpen = useStateBool(false);
	const popupOpen2 = useStateBool(false);
	const popupOpen3 = useStateBool(false);
	const popupOpen4 = useStateBool(false);
	const gameStart = useMutationGameStart(popupOpen2.setT);
	const gameReset = useMutationGameReset(popupOpen4.setT);

	// eslint-disable-next-line
	useEffect(() => duration.set(gameDuration.data?.duration || 0), [gameDuration.data]); // eslint-disable-next-line
	useEffect(() => counter.set(gameCounter.data?.counter || 0), [gameCounter.data]); // eslint-disable-next-line
	useEffect(() => startStr.set(gameStartStr.data?.startStr || ""), [gameStartStr.data]);

	return (
		<Layout centeredPage homeBtn gap="2rem">
			<h1>Настройки игры</h1>
			{gameStart.isLoading && <Spinner />}
			{gameDuration.isLoading && <Spinner />}
			{gameCounter.isLoading && <Spinner />}
			{mutateDuration.isLoading && <Spinner />}
			{mutateCounter.isLoading && <Spinner />}
			{mutateStartStr.isLoading && <Spinner />}
			{gameReset.isLoading && <Spinner />}
			{gameStartStr.isLoading && <Spinner />}
			{displayError(gameStart)}
			{displayError(gameDuration)}
			{displayError(gameCounter)}
			{displayError(mutateDuration)}
			{displayError(mutateCounter)}
			{displayError(gameReset)}
			{displayError(mutateStartStr)}
			<Link to="/game_screen" className={styles.openScreen}>Открыть экран</Link>
			<Link to="/game_characters" className={styles.openScreen}>Персонажи турнира</Link>
			<div className={styles.input}>
				<span>Время начала</span>
				<input type="text" value={startStr.v} onChange={e => startStr.set(e.target.value)} />
				{gameStartStr.data && startStr.v != gameStartStr.data.startStr && <>
					<button onClick={() => mutateStartStr.mutate(startStr.v)}><IconSave /></button>
					<button onClick={() => startStr.set(gameStartStr.data.startStr)}><IconCancel /></button>
				</>}
			</div>
			<div className={styles.input}>
				<span>Длительность игры (сек.)</span>
				<input type="number" value={duration.v} onChange={e => duration.set(e.target.valueAsNumber)} />
				{gameDuration.data && duration.v != gameDuration.data.duration && <>
					<button onClick={() => mutateDuration.mutate(duration.v)}><IconSave /></button>
					<button onClick={() => duration.set(gameDuration.data.duration)}><IconCancel /></button>
				</>}
			</div>
			<div className={styles.input}>
				<span>Обратный отсчёт (сек.)</span>
				<input type="number" value={counter.v} onChange={e => counter.set(e.target.valueAsNumber)} />
				{gameCounter.data && counter.v != gameCounter.data.counter && <>
					<button onClick={() => mutateCounter.mutate(counter.v)}><IconSave /></button>
					<button onClick={() => counter.set(gameCounter.data.counter)}><IconCancel /></button>
				</>}
			</div>
			{state.data?.state == "wait" && <button className={styles.start} onClick={popupOpen.setT}>Старт!</button>}
			<button className={styles.start} onClick={popupOpen3.setT}>Сбросить</button>
			<Popup open={popupOpen.v} close={popupOpen.setF} closeOnOutclick>
				<h2>Начать игру?</h2>
				<br />
				<button className={styles.start} onClick={() =>
				{
					popupOpen.setF();
					gameStart.mutate();
				}}>Начать</button>
			</Popup>
			<Popup open={popupOpen2.v} close={popupOpen2.setF} closeOnOutclick>
				<h2>Игра запущена!</h2>
			</Popup>
			<Popup open={popupOpen3.v} close={popupOpen3.setF} closeOnOutclick>
				<h2>Сбросить игру?</h2>
				<br />
				<button className={styles.start} onClick={() =>
				{
					popupOpen3.setF();
					gameReset.mutate();
				}}>Сбросить</button>
			</Popup>
			<Popup open={popupOpen4.v} close={popupOpen4.setF} closeOnOutclick>
				<h2>Игра сброшена!</h2>
			</Popup>
		</Layout>
	);
}
