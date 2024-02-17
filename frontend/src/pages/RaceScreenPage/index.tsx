import styles from "./styles.module.css"
import field from "./field.png"
import ost from "./ost.mp3"
import useStateObj from "../../utils/useStateObj";
import { useEffect } from "react";
import useStateBool from "../../utils/useStateBool";
import useSound from "../../utils/useSound";
import { useMutationRaceFinish, useRaceDuration, useRaceState } from "../../api/race";
import useRace from "./useRace";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";

const aspect = 472 / 629;

export default function RaceScreenPage()
{
	useTitle("Гонки");
	const raceDuration = useRaceDuration();
	const mutateFinish = useMutationRaceFinish();
	const race = useRace(raceDuration.data?.duration || 10);
	const state = useRaceState();
	const ostSound = useSound(ost, true);
	const soundEnable = useStateBool(false);
	const width = useStateObj(0);
	const counter = useStateObj(0);

	useEffect(() =>
	{
		let w = window.innerWidth;
		const h = w * aspect;
		if (h > window.innerHeight)
			w = window.innerHeight / aspect;
		width.set(w - 30);
		// eslint-disable-next-line
	}, [])

	useEffect(() =>
	{
		if (state.data?.state == "play" || state.data?.state == "nojoin")
		{
			race.start();
			return;
		}

		if (state.data?.state != "title") return;

		const t = setInterval(() => state.refetch(), 5000);

		return () => clearInterval(t);
	}, [state.data])

	useEffect(() =>
	{
		if (state.data?.state != "join" && state.data?.state != "wait") return;
		counter.set(state.data.counter);
		raceDuration.refetch();
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
	}, [state.data])

	useEffect(() =>
	{
		if (race.winner != "")
		{
			mutateFinish.mutate(race.winner);
		}
	}, [race.winner])

	return (
		<div className={styles.root}>
			{!soundEnable.v && <button
				className={styles.soundBtn}
				onClick={() =>
				{
					soundEnable.setT();
					ostSound();
				}}
			>
				Включить звук
			</button>}
			<div className={styles.field} style={{
				width: width.v, height: width.v * aspect,
				minWidth: width.v, minHeight: width.v * aspect,
				"--w": width.v
			} as React.CSSProperties}>
				<img className={styles.background} src={field} alt="Поле" />
				<div className={classNames(styles.snail1, race.started && styles.snailAnim)} style={{ right: snailPos(race.snail1) }} />
				<div className={classNames(styles.snail2, race.started && styles.snailAnim)} style={{ right: snailPos(race.snail2) }} />
				<div className={classNames(styles.snail3, race.started && styles.snailAnim)} style={{ right: snailPos(race.snail3) }} />
				<div className={classNames(styles.snail4, race.started && styles.snailAnim)} style={{ right: snailPos(race.snail4) }} />
				{(state.data?.state != "play" && state.data?.state != "nojoin" || race.title) && <div className={styles.msg}>
					{state.data?.state == "title" && <span>Скоро начало!</span>}
					{(state.data?.state == "join" || state.data?.state == "wait") &&
						<span>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</span>}
					{(state.data?.state == "won" || state.data?.state == "loss" || state.data?.state == "end") ?
						<span>Победитель: {{
							yellow: <span className={styles.c_yellow}>Жёлтый</span>,
							blue: <span className={styles.c_blue}>Синий</span>,
							red: <span className={styles.c_red}>Красный</span>,
							green: <span className={styles.c_green}>Зелёный</span>,
							"": "",
						}[state.data.winner]}</span>
						:
						(race.title) && <span>{race.title}</span>
					}
				</div>}
			</div>
		</div>
	);
}


function snailPos(passed: number)
{
	return passed * 69 + 16 + "%";
}