import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import IconCancel from "../../icons/cancel";
import IconSave from "../../icons/save";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";
import { useMutationGameCounter, useMutationGameDuration, useMutationGameReset, useMutationGameStart, useMutationGameStartStr, useGameCounter, useGameDuration, useGameStartStr, useGameState } from "../../api/game";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import { useTitle } from "../../utils/useTtile";
import TourneyEdit from "./TourneyEdit";
import { useMutationTourneyEndGame, useMutationTourneyReset, useMutationTourneySelectNextGame, useMutationTourneyStartGame } from "../../api/tourney";
import ConfirmingButton from "../../components/ConfirmingButton";
import type { UseMutationResult, UseQueryResult } from "react-query";

export default function GameSettingsPage()
{
	useTitle("Настройки игры");
	const state = useGameState();

	return (
		<Layout centeredPage homeBtn gap="2rem">
			<h1>Настройки игры</h1>
			<Link to="/game_screen" className={styles.openScreen}>Открыть экран</Link>
			<Link to="/tourney_screen" className={styles.openScreen}>Открыть турнир</Link>
			<Link to="/game_characters" className={styles.openScreen}>Персонажи турнира</Link>
			<Input text="Время начала" type="text" query={useGameStartStr} getv={d => d?.startStr || ""} newv={inp => inp.value} mutation={useMutationGameStartStr} />
			<Input text="Длительность игры (сек.)" type="number" query={useGameDuration} getv={d => d?.duration || 0} newv={inp => inp.valueAsNumber} mutation={useMutationGameDuration} />
			<Input text="Обратный отсчёт (сек.)" type="number" query={useGameCounter} getv={d => d?.counter || 0} newv={inp => inp.valueAsNumber} mutation={useMutationGameCounter} />
			<div className={styles.tourney}>
				<h3>Управление турниром</h3>
				<div>
					<ConfirmingButton className={styles.start} h="Выбрать следующую игру?" bt="Выбрать" rt="Игра выбрана!" mutation={useMutationTourneySelectNextGame}>Выбрать следующую игру</ConfirmingButton>
					<ConfirmingButton className={styles.start} h="Запустить игру?" bt="Запустить" rt="Игра запущена!" mutation={useMutationTourneyStartGame}>Запустить игру</ConfirmingButton>
					<ConfirmingButton className={styles.start} h="Завершить игру?" bt="Завершить" rt="Игра завершена!" mutation={useMutationTourneyEndGame}>Завершить игру</ConfirmingButton>
				</div>
			</div>
			<TourneyEdit />
			{state.data?.state == "wait" &&
				<ConfirmingButton className={styles.start} h="Начать игру?" bt="Начать" rt="Игра запущена!" mutation={useMutationGameStart}>Старт!</ConfirmingButton>
			}
			<ConfirmingButton className={styles.start} h="Сбросить игру?" bt="Сбросить" rt="Игра сброшена!" mutation={useMutationGameReset}>Сбросить</ConfirmingButton>
			<ConfirmingButton className={styles.start} h="Сбросить весь турнир?" bt="Сбросить" rt="Весь турнир сброшен!" mutation={useMutationTourneyReset}>Сбросить весь турнир</ConfirmingButton>
		</Layout>
	);
}

function Input<T, K extends number | string>({ text, type, getv, newv, query, mutation }: { text: string, type: "number" | "text", getv: (data?: T) => K, newv: (inp: HTMLInputElement) => K, query: () => UseQueryResult<T, unknown>, mutation: () => UseMutationResult<T, any, K, unknown> })
{
	const value = useStateObj(getv());
	const queryR = query();
	const mutate = mutation();

	// eslint-disable-next-line
	useEffect(() => value.set(getv(queryR.data)), [queryR.data]);

	return (
		<div className={styles.input}>
			{queryR.isLoading && <Spinner />}
			{mutate.isLoading && <Spinner />}
			{displayError(queryR)}
			{displayError(mutate)}
			<span>{text}</span>
			<input type={type} value={value.v} onChange={e => value.set(newv(e.target))} />
			{queryR.data && value.v != getv(queryR.data) && <>
				<button onClick={() => mutate.mutate(value.v)}><IconSave /></button>
				<button onClick={() => value.set(getv(queryR.data))}><IconCancel /></button>
			</>}
		</div>
	)
}
