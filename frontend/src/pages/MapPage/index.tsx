import styles from "./styles.module.css"
import map1 from "./map1.png";
import map2 from "./map2.png";
import map3 from "./map3.png";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import useStateObj from "../../utils/useStateObj";

export default function MapPage()
{
	const map = useStateObj(0);

	return (
		<Layout centeredPage headerColor="#042e40" gap="1em" className={styles.root} footer={<Footer curPage="map" />}>
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.map}>
				<img src={[map1, map2, map3][map.v]} alt="Карта" />
			</div>
			<div className={styles.btns}>
				<button onClick={() => map.set(0)} className={map.v == 0 ? styles.active : ""}>Этаж 1</button>
				<button onClick={() => map.set(1)} className={map.v == 1 ? styles.active : ""}>Этаж 2</button>
				<button onClick={() => map.set(2)} className={map.v == 2 ? styles.active : ""}>Маркет</button>
			</div>
		</Layout>
	);
}
