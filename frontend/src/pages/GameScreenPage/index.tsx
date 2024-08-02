import styles from "./styles.module.css"
import field from "./field.png"
import ost from "./ost.mp3"
import useStateObj from "../../utils/useStateObj";
import { useEffect } from "react";
import useStateBool from "../../utils/useStateBool";
import useSound from "../../utils/useSound";
import { useGameStateFull, type GameStateFull } from "../../api/game";
import { useTitle } from "../../utils/useTtile";
import displayError from "../../utils/displayError";

const aspect = 472 / 629;
// [!] Sometimes finish dont work

export default function GameScreenPage()
{
	useTitle("Игра");
	const state = useGameStateFull();
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
		if (state.isFetching) return;

		const delay = state.data?.state == "going" ? 1000 : 5000;
		const t = setTimeout(() => state.refetch(), delay);

		return () => clearTimeout(t);
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

	return (
		<div className={styles.root}>
			<div className={styles.field} style={{
				width: width.v, height: width.v * aspect,
				minWidth: width.v, minHeight: width.v * aspect,
				"--w": width.v,
				"--bar": state.isSuccess ? getPercent(state.data) : "50%",
			} as React.CSSProperties}>
				<img className={styles.background} src={field} alt="Поле" />
				<div className={styles.bar}>
					<div>Сапожники</div>
					<div>Кактусы</div>
				</div>
				<div className={styles.msg}>
					{displayError(state)}
					{state.isSuccess && <>
						{state.data.state == "wait" && <span>Скоро начало!</span>}
						{(state.data.state == "start" || state.data.state == "going") &&
							<span>{Math.floor(counter.v / 60)}:{(counter.v % 60).toString().padStart(2, "0")}</span>}

						{state.data.state == "end" && <>
							<span>Победитель:</span>
							{state.data.winner == 1 && <span>Сапожники!</span>}
							{state.data.winner == 2 && <span>Кактусы!</span>}
						</>}
					</>}
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
				</div>
			</div>
		</div>
	);
}

function getPercent(data: GameStateFull)
{
	const sum = data.clicks1 + data.clicks2;
	if (sum == 0) return "50%";
	return `${data.clicks1 / sum * 100}%`;
}
