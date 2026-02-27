"use client"
import { useEffect } from "react";
import IconCancel from "@icons/cancel";
import IconSave from "@icons/save";
import useStateObj from "@/utils/useStateObj";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import TourneyEdit from "./TourneyEdit";
import { useTitle } from "@/utils/useTtile";
import useSecuredPage from "@/utils/useSecuredPage";
import { characterById, findTourneyTreeNode, useMutationTourneyEndGame, useMutationTourneyEndTourney, useMutationTourneyReset, useMutationTourneySelectNextGame, useMutationTourneyShowPretourney, useMutationTourneyStartGame, useMutationTourneyUnendTourney, useTourneyCharacters, useTourneyData } from "@/api/tourney";
import Link from "next/link";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useGameCounter, useGameDuration, useGameStartPhrase, useGameStartStr, useMutationGameCounter, useMutationGameDuration, useMutationGameStartPhrase, useMutationGameStartStr, useUpdateGameStartStr } from "@/api/game";
import ConfirmingButton from "./ConfirmingButton";
import Input from "@sCmps/Input";
import Button from "@sCmps/Button";
import styles from "./page.module.css"
import useStateBool from "@/utils/useStateBool";
import clsx from "@/utils/clsx";
import StartTimeList from "./StartTimeList";
import Help from "@sCmps/Help";

export default function Page()
{
	useTitle("Настройки игры");
	useSecuredPage("manage_games");
	const tourney = useTourneyData();
	const characters = useTourneyCharacters();
	const curGame = findTourneyTreeNode(tourney.data?.tree, tourney.data?.curGameNodeId || 0, tourney.data?.third || -1);
	const curGameWinner = characterById(characters.data, curGame?.characterId);

	const updateGameStartStr = useUpdateGameStartStr();

	return <>
		<h1 className="layout_gap">Настройки игры</h1>
		{tourney.isLoading && <Spinner />}
		{displayError(tourney)}
		<Link href="/tourney_screen" className={styles.link}>Открыть экран</Link>
		<Link href="/game_characters" className={styles.link}>Персонажи турнира</Link>
		<SettingInput text={<StartTimeList games={tourney.data?.games} />} type="text" query={useGameStartStr} getv={d => d?.startStr || ""} mutation={useMutationGameStartStr} />
		<SettingInput text={<span>Предтурнирная фраза <Help text="Доллар заменяется на время начала" /></span>} type="textarea" query={useGameStartPhrase} getv={d => d?.startPhrase || ""} mutation={useMutationGameStartPhrase} check={v => !v.includes("$") && "Вы забыли доллар"} />
		<SettingInput text="Длительность игры (сек.)" type="number" query={useGameDuration} getv={d => d?.duration || 0} mutation={useMutationGameDuration} />
		<SettingInput text="Обратный отсчёт (сек.)" type="number" query={useGameCounter} getv={d => d?.counter || 0} mutation={useMutationGameCounter} />
		<div className={styles.tourney}>
			<h3>Управление турниром</h3>
			<div>
				<ConfirmingButton text="Выбрать следующую игру" bt="Выбрать" rt={(tourney.data?.curGameNodeId || -1) >= 0 ? "Игра выбрана!" : "Игра не выбрана"} disabled={tourney.data?.ended || !tourney.data || tourney.data?.showGame || (tourney.data.curGameNodeId != -1 && !curGameWinner)} mutation={useMutationTourneySelectNextGame} />
				<ConfirmingButton text="Запустить игру" bt="Запустить" rt="Игра запущена!" disabled={tourney.data?.ended || !tourney.data || tourney.data?.showGame || tourney.data.curGameNodeId == -1 || !!curGameWinner} mutation={useMutationTourneyStartGame} />
				<ConfirmingButton text="Завершить игру" bt="Завершить" rt="Игра завершена!" disabled={tourney.data?.ended || !tourney.data?.showGame} mutation={useMutationTourneyEndGame} onSuccess={updateGameStartStr} />
			</div>
			<div>
				<div style={{ flexGrow: 1 }}></div>
				<ConfirmingButton text="Отобразить предтурнирный экран" bt="Отобразить" rt="Предтурнирный экран отображён!" mutation={useMutationTourneyShowPretourney} />
				<ConfirmingButton text="Отменить завершение турнира" className={!tourney.data?.ended && styles.hidden} bt="Отменить" rt="Завершение турнира отменено!" mutation={useMutationTourneyUnendTourney} />
				<ConfirmingButton text="Завершить турнир" btnText={<span>Завершить турнир <Help text="Это действие отображает финальный экран, ничего более" /></span>} className={tourney.data?.ended && styles.hidden} bt="Завершить" rt="Турнир завершён!" mutation={useMutationTourneyEndTourney} />
			</div>
		</div>
		<TourneyEdit />
		<ConfirmingButton text="Сбросить весь турнир" className={styles.start} bt="Сбросить" rt="Весь турнир сброшен!" mutation={useMutationTourneyReset} />
	</>;
}

function SettingInput<T, K extends number | string>({ text, type, getv, query, mutation, check }: {
	text: React.ReactNode,
	type: "number" | "text" | "textarea",
	getv: (data?: T) => K,
	query: () => UseQueryResult<T, unknown>,
	mutation: (onSuccess?: () => void) => UseMutationResult<T, unknown, K, unknown>,
	check?: (v: K) => string | null | undefined | false,
})
{
	const showSaved = useStateBool(false);
	const showError = useStateObj<string | null | undefined | false>("");
	const value = useStateObj(getv(), check ? v => showError.set(check(v)) : undefined);
	const queryR = query();
	const mutate = mutation(showSaved.setT);

	// eslint-disable-next-line
	useEffect(() => value.set(getv(queryR.data)), [queryR.data]);

	return (
		<div className={clsx(styles.input, type == "textarea" && styles.input_long)}>
			{queryR.isLoading && <Spinner />}
			{mutate.isPending && <Spinner />}
			{displayError(queryR)}
			{displayError(mutate)}
			<span>{text}</span>
			<span className={clsx(styles.input__saved, showSaved.v && styles.input__saved_visible)}>Сохранено!</span>
			<span className={clsx(styles.input__error, showError.v && styles.input__error_visible)}>{showError.v}</span>
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			<Input type={type} stateObj={value as any} />
			{queryR.data && value.v != getv(queryR.data) && <>
				<Button text={<IconSave />} onClick={() => { showSaved.setF(); mutate.mutate(value.v) }} />
				<Button text={<IconCancel />} onClick={() => value.set(getv(queryR.data))} />
			</>}
		</div>
	)
}
