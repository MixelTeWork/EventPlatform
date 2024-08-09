import styles from "./styles.module.css"
import map1 from "./map1.png";
import map2 from "./map2.png";
import map3 from "./map3.png";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import useStateObj from "../../utils/useStateObj";
import { useTitle } from "../../utils/useTtile";
import GameDialogGreetings from "../../components/GameDialogGreetings";
import classNames from "../../utils/classNames";
import Textbox from "../../components/Textbox";

export default function MapPage()
{
	useTitle("Карта");
	const map = useStateObj(0);

	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="map" />}>
			<GameDialogGreetings />
			<h1 className={classNames("title", styles.title)}>Индикон</h1>
			<div className={styles.map}>
				<img src={[map1, map2, map3][map.v]} alt="Карта" />
			</div>
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
