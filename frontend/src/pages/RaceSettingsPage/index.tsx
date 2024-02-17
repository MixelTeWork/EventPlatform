import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import IconCancel from "../../icons/cancel";
import IconSave from "../../icons/save";
import styles from "./styles.module.css"
import useStateObj from "../../utils/useStateObj";
import { useMutationRaceCounter, useMutationRaceDuration, useMutationRacePrice, useMutationRaceReset, useMutationRaceStart, useMutationRaceStartStr, useRaceCounter, useRaceDuration, useRacePrice, useRaceStartStr } from "../../api/race";
import Popup from "../../components/Popup";
import useStateBool from "../../utils/useStateBool";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useEffect } from "react";
import { useTitle } from "../../utils/useTtile";

export default function RaceSettingsPage()
{
	useTitle("Настройки гонок");
	const raceDuration = useRaceDuration();
	const raceCounter = useRaceCounter();
	const racePrice = useRacePrice();
	const raceStartStr = useRaceStartStr();
	const mutateDuration = useMutationRaceDuration();
	const mutateCounter = useMutationRaceCounter();
	const mutatePrice = useMutationRacePrice();
	const mutateStartStr = useMutationRaceStartStr();
	const duration = useStateObj(0);
	const counter = useStateObj(0);
	const price = useStateObj(0);
	const startStr = useStateObj("");
	const popupOpen = useStateBool(false);
	const popupOpen2 = useStateBool(false);
	const popupOpen3 = useStateBool(false);
	const popupOpen4 = useStateBool(false);
	const raceStart = useMutationRaceStart(popupOpen2.setT);
	const raceReset = useMutationRaceReset(popupOpen4.setT);

	useEffect(() => duration.set(raceDuration.data?.duration || 0), [raceDuration.data]);
	useEffect(() => counter.set(raceCounter.data?.counter || 0), [raceCounter.data]);
	useEffect(() => price.set(racePrice.data?.price || 0), [racePrice.data]);
	useEffect(() => startStr.set(raceStartStr.data?.startStr || ""), [raceStartStr.data]);

	return (
		<Layout centeredPage homeBtn gap="2rem">
			<h1>Настройки гонок</h1>
			{raceStart.isLoading && <Spinner />}
			{raceDuration.isLoading && <Spinner />}
			{raceCounter.isLoading && <Spinner />}
			{mutateDuration.isLoading && <Spinner />}
			{mutateCounter.isLoading && <Spinner />}
			{mutatePrice.isLoading && <Spinner />}
			{mutateStartStr.isLoading && <Spinner />}
			{raceReset.isLoading && <Spinner />}
			{racePrice.isLoading && <Spinner />}
			{raceStartStr.isLoading && <Spinner />}
			{displayError(raceStart)}
			{displayError(raceDuration)}
			{displayError(raceCounter)}
			{displayError(mutateDuration)}
			{displayError(mutateCounter)}
			{displayError(raceReset)}
			{displayError(racePrice)}
			{displayError(mutateStartStr)}
			<Link to="/race_screen" className={styles.openScreen}>Открыть экран</Link>
			<div className={styles.input}>
				<span>Время начала</span>
				<input type="text" value={startStr.v} onChange={e => startStr.set(e.target.value)} />
				{raceStartStr.data && startStr.v != raceStartStr.data.startStr && <>
					<button onClick={() => mutateStartStr.mutate(startStr.v)}><IconSave /></button>
					<button onClick={() => startStr.set(raceStartStr.data.startStr)}><IconCancel /></button>
				</>}
			</div>
			<div className={styles.input}>
				<span>Цена участия</span>
				<input type="number" value={price.v} onChange={e => price.set(e.target.valueAsNumber)} />
				{racePrice.data && price.v != racePrice.data.price && <>
					<button onClick={() => mutatePrice.mutate(price.v)}><IconSave /></button>
					<button onClick={() => price.set(racePrice.data.price)}><IconCancel /></button>
				</>}
			</div>
			<div className={styles.input}>
				<span>Длительность игры (сек.)</span>
				<input type="number" value={duration.v} onChange={e => duration.set(e.target.valueAsNumber)} />
				{raceDuration.data && duration.v != raceDuration.data.duration && <>
					<button onClick={() => mutateDuration.mutate(duration.v)}><IconSave /></button>
					<button onClick={() => duration.set(raceDuration.data.duration)}><IconCancel /></button>
				</>}
			</div>
			<div className={styles.input}>
				<span>Обратный отсчёт (сек.)</span>
				<input type="number" value={counter.v} onChange={e => counter.set(e.target.valueAsNumber)} />
				{raceCounter.data && counter.v != raceCounter.data.counter && <>
					<button onClick={() => mutateCounter.mutate(counter.v)}><IconSave /></button>
					<button onClick={() => counter.set(raceCounter.data.counter)}><IconCancel /></button>
				</>}
			</div>
			<button className={styles.start} onClick={popupOpen.setT}>Старт!</button>
			<button className={styles.start} onClick={popupOpen3.setT}>Сбросить</button>
			<Popup open={popupOpen.v} close={popupOpen.setF} closeOnOutclick>
				<h2>Начать гонку?</h2>
				<br />
				<button className={styles.start} onClick={() =>
				{
					popupOpen.setF();
					raceStart.mutate();
				}}>Начать</button>
			</Popup>
			<Popup open={popupOpen2.v} close={popupOpen2.setF} closeOnOutclick>
				<h2>Гонка запущена!</h2>
			</Popup>
			<Popup open={popupOpen3.v} close={popupOpen3.setF} closeOnOutclick>
				<h2>Сбросить гонку?</h2>
				<br />
				<button className={styles.start} onClick={() =>
				{
					popupOpen3.setF();
					raceReset.mutate();
				}}>Сбросить</button>
			</Popup>
			<Popup open={popupOpen4.v} close={popupOpen4.setF} closeOnOutclick>
				<h2>Гонка сброшена!</h2>
			</Popup>
		</Layout>
	);
}
