import styles from "./styles.module.css"
import ost from "./ost.mp3"
import useStateObj from "../../utils/useStateObj";
import { useEffect, useRef } from "react";
import useStateBool from "../../utils/useStateBool";
import useSound from "../../utils/useSound";
import { useGameStateFull, type GameStateFull } from "../../api/game";
import { useTitle } from "../../utils/useTtile";
import displayError from "../../utils/displayError";
import classNames from "../../utils/classNames";

export default function GameScreenPage()
{
	useTitle("Игра");
	const state = useGameStateFull();
	const ostSound = useSound(ost, true);
	const soundEnable = useStateBool(false);
	const counter = useStateObj(0);
	const rectsEl = useRef<HTMLDivElement>(null);
	// const bar = useStateObj(0);

	useEffect(() =>
	{
		if (state.isFetching) return;

		const delay = state.data?.state == "going" ? 250 : 5000;
		const t = setTimeout(() => state.refetch(), delay);

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
		if (!state.data) return;
		if (!soundEnable.v) return;

		if (state.data.state == "going")
			ostSound.play();
		else
			ostSound.stop();
	}, [state.data, soundEnable.v])

	// useEffect(() =>
	// {
	// 	const t = setInterval(() =>
	// 	{
	// 		bar.set(v => (v + 10) % 200);
	// 	}, 1000);
	// 	return () => clearInterval(t);
	// }, [])

	useEffect(() =>
	{
		if (!rectsEl.current || state.data?.state != "going") return;
		const t = setInterval(() =>
		{
			if (state.data?.state != "going") return;
			if (rectsEl.current)
				spawnRect(rectsEl.current);
		}, 100);
		return () => clearInterval(t);
	}, [rectsEl, state.data?.state])

	return (
		<div className={classNames(styles.root, state.data?.state == "going" && styles.going)} style={{
			"--bar": state.isSuccess ? getPercent(state.data) : "50",
			// "--bar": `${Math.abs(bar.v - 100)}`,
			// "--bar": `40`,
		} as React.CSSProperties}>
			<div className={styles.rects} ref={rectsEl}></div>
			<div className={styles.frame}></div>
			<div className={styles.barShake}>
				<div className={styles.bar}>
					<div className={styles.barLeft}>
						<span>Вернуться</span>
						{/* <div className={styles.nums}>{state.isSuccess && `${round(state.data.clicks1)} - ${round(state.data.clicks2)}`}</div> */}
						<div className={styles.nums}>Персонажи должны...</div>
					</div>
					<div className={styles.barRight}>Остаться</div>
				</div>
			</div>
			<div className={styles.msg}>
				<div>
					{displayError(state)}
					{state.isSuccess && <>
						{state.data.state == "wait" && <span>Скоро начало!</span>}
						{(state.data.state == "start" || state.data.state == "going") &&
							<span>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</span>}

						{state.data.state == "end" && <>
							<span>Персонажи должны </span>
							<span className="title" style={{ marginLeft: "0.25em" }}>{state.data.winner == 1 ? "Вернуться" : "Остаться"}</span>
							<span>!</span>
						</>}
					</>}
					{!soundEnable.v && <button
						className={styles.soundBtn}
						onClick={soundEnable.setT}
					>
						Включить звук
					</button>}
				</div>
			</div>
		</div>
	);
}

function getPercent(data: GameStateFull)
{
	const sum = data.clicks1 + data.clicks2;
	if (sum == 0) return "50";
	return `${data.clicks1 / sum * 100}`;
}
function spawnRect(parent: HTMLDivElement)
{
	const rect = document.createElement("div");
	parent.appendChild(rect);
	rect.style.top = `${Math.random() * 100}%`;
	rect.style.left = `${Math.random() * 100}%`;

	setTimeout(() => parent.removeChild(rect), 1000);
}
// function round(num: number)
// {
// 	return Math.floor(num * 10) / 10;
// }