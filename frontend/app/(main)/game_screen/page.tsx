"use client"
import styles from "./styles.module.css"
// import ost from "./ost.mp3"
import { useEffect, useRef } from "react";
import useStateBool from "@/utils/useStateBool";
// import useSound from "@/utils/useSound";
import { useTitle } from "@/utils/useTtile";
import { useGame } from "./game";
import { useTourneyCharacters } from "@/api/tourney";
import { characterById } from "@/api/tourney";
import clsx from "@/utils/clsx";

export default function Page()
{
	useTitle("Игра");
	const game = useGame();
	const characters = useTourneyCharacters();
	// const ostSound = useSound(ost, true);
	const soundEnable = useStateBool(true);
	const rectsEl = useRef<HTMLDivElement>(null);

	const characterLeft = characterById(characters.data, game.opponentLeftId);
	const characterRight = characterById(characters.data, game.opponentRightId);
	const characterWinner = characterById(characters.data, game.winnerId);

	// useEffect(() =>
	// {
	// 	if (!soundEnable.v) return;

	// 	if (game.isGoing)
	// 		ostSound.play(soundEnable.set);
	// 	else
	// 		ostSound.stop();
	// 	// eslint-disable-next-line
	// }, [game.isGoing, soundEnable.v])

	useEffect(() =>
	{
		if (!rectsEl.current || !game.isGoing) return;
		const t = setInterval(() =>
		{
			if (!game.isGoing) return;
			if (rectsEl.current)
				spawnRect(rectsEl.current);
		}, 100);
		return () => clearInterval(t);
	}, [rectsEl, game.isGoing])

	return (
		<div className={clsx(styles.root, game.isGoing && styles.going)} style={{ "--bar": game.barPercent } as React.CSSProperties}>
			<div className={styles.rects} ref={rectsEl}></div>
			<div className={styles.frame}></div>
			<div className={styles.barShake}>
				<div className={styles.bar}>
					<div className={styles.barLeft} style={{ "--color": characterLeft?.color } as React.CSSProperties}>
						<span>{characterLeft?.name}</span>
						<div className={styles.bar__img}><img src={characterLeft?.img} alt={characterLeft?.name} /></div>
						<div className={styles.nums}></div>
					</div>
					<div className={styles.barRight} style={{ "--color": characterRight?.color } as React.CSSProperties}>
						<div className={styles.bar__img}><img src={characterRight?.img} alt={characterRight?.name} /></div>
						<span>{characterRight?.name}</span>
					</div>
				</div>
			</div>
			<div className={styles.msg}>
				{game.titleType == "error" && <h3 style={{ color: "tomato", textAlign: "center" }}>{game.error}</h3>}
				{game.titleType == "load" && <span>Загрузка...</span>}
				{game.titleType == "wait" && <span>Скоро начало!</span>}
				{game.titleType == "counter" && <span>{game.getCounter()}</span>}
				{game.titleType == "winner" && <>
					<span>Побеждает </span>
					<span className="title" style={{ marginLeft: "0.25em" }}>{characterWinner?.name}</span>
					<span>!</span>
				</>}
				{!soundEnable.v && <button
					className={styles.soundBtn}
					onClick={soundEnable.setT}
				>
					Включить звук
				</button>}
			</div>
		</div>
	);
}

function spawnRect(parent: HTMLDivElement)
{
	const rect = document.createElement("div");
	parent.appendChild(rect);
	rect.style.top = `${Math.random() * 100}%`;
	rect.style.left = `${Math.random() * 100}%`;

	setTimeout(() => parent.removeChild(rect), 1000);
}
