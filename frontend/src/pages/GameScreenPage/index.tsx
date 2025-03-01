import styles from "./styles.module.css"
import ost from "./ost.mp3"
import { useEffect, useRef } from "react";
import useStateBool from "../../utils/useStateBool";
import useSound from "../../utils/useSound";
import { useTitle } from "../../utils/useTtile";
import classNames from "../../utils/classNames";
import { useGame } from "./game";

export default function GameScreenPage()
{
	useTitle("Игра");
	const game = useGame();
	const ostSound = useSound(ost, true);
	const soundEnable = useStateBool(false);
	const rectsEl = useRef<HTMLDivElement>(null);

	useEffect(() =>
	{
		if (!soundEnable.v) return;

		if (game.isGoing)
			ostSound.play();
		else
			ostSound.stop();
	// eslint-disable-next-line
	}, [game.isGoing, soundEnable.v])

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
		<div className={classNames(styles.root, game.isGoing && styles.going)} style={{ "--bar": game.barPercent } as React.CSSProperties}>
			<div className={styles.rects} ref={rectsEl}></div>
			<div className={styles.frame}></div>
			<div className={styles.barShake}>
				<div className={styles.bar}>
					<div className={styles.barLeft}>
						<span>{game.textLeft}</span>
						<div className={styles.nums}>{game.textCenter}</div>
					</div>
					<div className={styles.barRight}>{game.textRight}</div>
				</div>
			</div>
			<div className={styles.msg}>
				<div>
					{game.title}
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

function spawnRect(parent: HTMLDivElement)
{
	const rect = document.createElement("div");
	parent.appendChild(rect);
	rect.style.top = `${Math.random() * 100}%`;
	rect.style.left = `${Math.random() * 100}%`;

	setTimeout(() => parent.removeChild(rect), 1000);
}
