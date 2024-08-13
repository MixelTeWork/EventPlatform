import styles from "./styles.module.css"
import map1 from "./map1.png";
import map2 from "./map2.png";
import map3 from "./map3.png";
import mark_mady from "./marks/mady.png";
import mark_info from "./marks/info.png";
import mark_indi from "./marks/indi.png";
import mark_game from "./marks/game.png";
import mark_stand from "./marks/stand.png";
import mark_banner from "./marks/banner.png";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import useStateObj from "../../utils/useStateObj";
import { useTitle } from "../../utils/useTtile";
import GameDialogGreetings from "../../components/GameDialogGreetings";
import classNames from "../../utils/classNames";
import Textbox from "../../components/Textbox";
import StyledWindow from "../../components/StyledWindow";
import InteractiveMap from "./InteractiveMap";

export default function MapPage()
{
	useTitle("Карта");
	const map = useStateObj(0);

	return (
		<Layout centeredPage className={styles.root} footer={<Footer curPage="map" />}>
			<GameDialogGreetings />
			<h1 className={classNames("title", styles.title)}>Индикон</h1>
			<StyledWindow className={styles.window}>
				<div className={styles.map}>
					<InteractiveMap
						img={[map1, map2, map3][map.v]}
						imgW={2150}
						imgH={1512}
						zoomMin={1}
						disablePadding
						fillOnStart
						// objectsOpacity={0.5}
						objects={[[
							{ img: mark_mady, x: 3.6, y: 6.9, w: 11.2, h: 14 },
							{ img: mark_info, x: 56.5, y: 75.3, w: 21.2, h: 17.1 },
						], [
							{ img: mark_mady, x: 3.6, y: 6.9, w: 11.2, h: 14 },
							{ img: mark_indi, x: 4.7, y: 26.3, w: 17.9, h: 35.5 },
							{ img: mark_game, x: 23.9, y: 45.5, w: 12.2, h: 19.7 },
							{ img: mark_stand, x: 37.4, y: 49.9, w: 11.2, h: 21.2 },
							{ img: mark_banner, x: 62.7, y: 47.5, w: 9.1, h: 19.1 },
						], [
							{ img: mark_mady, x: 3.6, y: 6.9, w: 11.2, h: 14 },
						]][map.v]}
					/>
				</div>
			</StyledWindow>
			<div className={styles.btns}>
				<Textbox small btn highlight={map.v == 0}>
					<button onClick={() => map.set(0)} className={classNames(styles.btn, "title")}>Этаж 1</button>
				</Textbox>
				<Textbox small btn highlight={map.v == 1}>
					<button onClick={() => map.set(1)} className={classNames(styles.btn, "title")}>Этаж 2</button>
				</Textbox>
				<Textbox small btn highlight={map.v == 2}>
					<button onClick={() => map.set(2)} className={classNames(styles.btn, "title")}>Этаж 3</button>
				</Textbox>
			</div>
		</Layout>
	);
}
