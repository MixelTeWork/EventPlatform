"use client"
import styles from "./styles.module.css"
import { useTitle } from "@/utils/useTtile";
import { useTourney } from "./tourney";

export default function TourneyPage()
{
	useTitle("Турнир");
	const tourney = useTourney();

	return (
		<div className={styles.root}>
			<canvas ref={el => { if (el) tourney.setCanvas(el) }}></canvas>
		</div>
	);
}
