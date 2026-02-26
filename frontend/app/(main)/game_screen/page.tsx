"use client"
import styles from "./styles.module.css"
import wait_1 from "./ost/wait_1.mp3"
import wait_2 from "./ost/wait_2.mp3"
import wait_3 from "./ost/wait_3.mp3"
import game_1 from "./ost/game_1.mp3"
import game_2 from "./ost/game_2.mp3"
import game_3 from "./ost/game_3.mp3"
import game_4 from "./ost/game_4.mp3"
import game_5 from "./ost/game_5.mp3"
import game_6 from "./ost/game_6.mp3"
import game_7 from "./ost/game_7.mp3"
import game_8 from "./ost/game_8.mp3"
import game_9 from "./ost/game_9.mp3"
import game_10 from "./ost/game_10.mp3"
import { useEffect, useRef } from "react";
import useStateBool from "@/utils/useStateBool";
import useSound from "@/utils/useSound";
import { useTitle } from "@/utils/useTtile";
import { useGame } from "./game";
import { useTourneyCharacters } from "@/api/tourney";
import { characterById } from "@/api/tourney";
import clsx from "@/utils/clsx";
import useStateObj from "@/utils/useStateObj"
import randomInt from "@/utils/randomInt"

export default function Page()
{
	useTitle("Игра");
	const game = useGame();
	const characters = useTourneyCharacters();
	const rectsEl = useRef<HTMLDivElement>(null);

	const characterLeft = characterById(characters.data, game.opponentLeftId);
	const characterRight = characterById(characters.data, game.opponentRightId);
	const characterWinner = characterById(characters.data, game.winnerId);

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
			{/* <div className={styles.frame}></div> */}
			<div className={styles.barShake}>
				<div className={styles.bar}>
					<div className={styles.barLeft} style={{ "--color": characterLeft?.color } as React.CSSProperties}>
						<span>{characterLeft?.name}</span>
						<div className={styles.bar__img}><img src={characterLeft?.img || SINGLE_TRANSPARENT_PIXEL} alt={characterLeft?.name} /></div>
						<div className={styles.nums}></div>
					</div>
					<div className={styles.barRight} style={{ "--color": characterRight?.color } as React.CSSProperties}>
						<div className={styles.bar__img}><img src={characterRight?.img || SINGLE_TRANSPARENT_PIXEL} alt={characterRight?.name} /></div>
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
				<SoundPlayer gameIsGoing={game.isGoing} />
			</div>
		</div>
	);
}
const SINGLE_TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR4AQEFAPr/AAAAAAAABQABZHiVOAAAAABJRU5ErkJggg==";

function spawnRect(parent: HTMLDivElement)
{
	const rect = document.createElement("div");
	parent.appendChild(rect);
	rect.style.top = `${Math.random() * 100}%`;
	rect.style.left = `${Math.random() * 100}%`;

	setTimeout(() => parent.removeChild(rect), 1000);
}

function SoundPlayer({ gameIsGoing }: { gameIsGoing: boolean })
{
	const ostWait = [wait_1, wait_2, wait_3];
	const ostGame = [game_1, game_2, game_3, game_4, game_5, game_6, game_7, game_8, game_9, game_10]
	const ostWaitI = useStateObj(randomInt(ostWait.length));
	const ostGameI = useStateObj(randomInt(ostGame.length));
	const ostSoundWait = useSound(ostWait[ostWaitI.v], true);
	const ostSoundGame = useSound(ostGame[ostGameI.v], true);
	const soundEnabled = useStateBool(false);

	useEffect(() =>
	{
		if (!soundEnabled.v) return;

		if (gameIsGoing)
		{
			ostSoundGame.play();
			ostSoundWait.stop();
		}
		else
		{
			ostSoundGame.stop();
			ostSoundWait.play();
		}
		// eslint-disable-next-line
	}, [gameIsGoing, soundEnabled.v])

	return <>
		{/* <div ref={el => { if (!el || !ostSoundWait.el) return; el.innerHTML = ""; ostSoundWait.el.controls = true; el.appendChild(ostSoundWait.el) }}></div> */}
		{/* <div ref={el => { if (!el || !ostSoundGame.el) return; el.innerHTML = ""; ostSoundGame.el.controls = true; el.appendChild(ostSoundGame.el) }}></div> */}
		{!soundEnabled.v && <button
			className={styles.soundBtn}
			onClick={soundEnabled.setT}
		>
			Включить звук
		</button>}
	</>
}