import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import IconCancel from "../../icons/cancel";
import IconSave from "../../icons/save";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";
import { useMutationGameCounter, useMutationGameDuration, useMutationGameStartStr, useGameCounter, useGameDuration, useGameStartStr } from "../../api/game";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import { useTitle } from "../../utils/useTtile";
import TourneyEdit from "./TourneyEdit";
import { useMutationTourneyEndGame, useMutationTourneyEndTourney, useMutationTourneyReset, useMutationTourneySelectNextGame, useMutationTourneyShowPretourney, useMutationTourneyStartGame, useMutationTourneyUnendTourney, useTourneyData } from "../../api/tourney";
import ConfirmingButton from "../../components/ConfirmingButton";
import type { UseMutationResult, UseQueryResult } from "react-query";
import classNames from "../../utils/classNames";

export default function GameSettingsPage()
{
	useTitle("Настройки игры");
	const tourney = useTourneyData();

	return (
		<Layout centeredPage homeBtn gap="2rem" forStaff>
			<h1>Настройки игры</h1>
			{tourney.isLoading && <Spinner />}
			{displayError(tourney)}
			<Link to="/tourney_screen" className={styles.openScreen}>Открыть экран</Link>
			<Link to="/game_characters" className={styles.openScreen}>Персонажи турнира</Link>
			<Input text="Время начала" type="text" query={useGameStartStr} getv={d => d?.startStr || ""} newv={inp => inp.value} mutation={useMutationGameStartStr} />
			<Input text="Длительность игры (сек.)" type="number" query={useGameDuration} getv={d => d?.duration || 0} newv={inp => inp.valueAsNumber} mutation={useMutationGameDuration} />
			<Input text="Обратный отсчёт (сек.)" type="number" query={useGameCounter} getv={d => d?.counter || 0} newv={inp => inp.valueAsNumber} mutation={useMutationGameCounter} />
			<div className={styles.tourney}>
				<h3>Управление турниром</h3>
				<div>
					<ConfirmingButton className={styles.start} h="Выбрать следующую игру?" bt="Выбрать" rt="Игра выбрана!" disabled={!tourney.data || tourney.data?.showGame} mutation={useMutationTourneySelectNextGame}>Выбрать следующую игру</ConfirmingButton>
					<ConfirmingButton className={styles.start} h="Запустить игру?" bt="Запустить" rt="Игра запущена!" disabled={!tourney.data || tourney.data?.showGame || tourney.data.curGameNodeId == -1} mutation={useMutationTourneyStartGame}>Запустить игру</ConfirmingButton>
					<ConfirmingButton className={styles.start} h="Завершить игру?" bt="Завершить" rt="Игра завершена!" disabled={!tourney.data?.showGame} mutation={useMutationTourneyEndGame}>Завершить игру</ConfirmingButton>
				</div>
				<div>
					<div style={{ flexGrow: 1 }}></div>
					<ConfirmingButton className={styles.start} h="Отобразить предтурнирный экран?" bt="Отобразить" rt="Предтурнирный экран отображён!" mutation={useMutationTourneyShowPretourney}>Отобразить предтурнирный экран</ConfirmingButton>
					<ConfirmingButton className={classNames(styles.start, !tourney.data?.ended && styles.hidden)} h="Отменить завершение турнира?" bt="Отменить" rt="Завершение турнира отменено!" mutation={useMutationTourneyUnendTourney}>Отменить завершение турнира</ConfirmingButton>
					<ConfirmingButton className={classNames(styles.start, tourney.data?.ended && styles.hidden)} h="Завершить турнир?" bt="Завершить" rt="Турнир завершён!" mutation={useMutationTourneyEndTourney}>Завершить турнир</ConfirmingButton>
				</div>
			</div>
			<TourneyEdit />
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
