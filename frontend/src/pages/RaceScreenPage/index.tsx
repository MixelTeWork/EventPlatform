import styles from "./styles.module.css"
import field from "./field.png"
import ost from "./ost_.mp3"
import useStateObj from "../../utils/useStateObj";
import { useEffect } from "react";
import useStateBool from "../../utils/useStateBool";
import useSound from "../../utils/useSound";

const aspect = 472 / 629;

export default function RaceScreenPage()
{
	const ostSound = useSound(ost, true);
	const soundEnable = useStateBool(false);
	const width = useStateObj(0);

	useEffect(() =>
	{
		let w = window.innerWidth;
		const h = w * aspect;
		if (h > window.innerHeight)
			w = window.innerHeight / aspect;
		width.set(w);
	}, [])

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
			<div className={styles.field} style={{ width: width.v, height: width.v * aspect }}>
				<img className={styles.background} src={field} alt="Поле" />
				<div className={styles.snail1} style={{ right: snailPos(0.5) }} />
				<div className={styles.snail2} style={{ right: snailPos(1) }} />
				<div className={styles.snail3} style={{ right: snailPos(0.2) }} />
				<div className={styles.snail4} style={{ right: snailPos(0) }} />
			</div>
		</div>
	);
}


function snailPos(passed: number)
{
	return passed * 69 + 16 + "%";
}