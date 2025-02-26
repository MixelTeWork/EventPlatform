import styles from "./styles.module.css"
import { useTourney } from "./tourney";

export default function TourneyPage()
{
	const tourney = useTourney();

	return (
		<div className={styles.root}>
			<canvas ref={el => el && tourney.setCanvas(el)}></canvas>
		</div>
	);
}
