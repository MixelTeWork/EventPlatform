import styles from "./styles.module.css"
import map1 from "./map1.png";
import map2 from "./map2.png";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import useStateBool from "../../utils/useStateBool";

export default function MapPage()
{
	const firstMap = useStateBool(true);

	return (
		<Layout centeredPage headerColor="#042e40" gap="1em" className={styles.root} footer={<Footer curPage="map" />}>
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.map}>
				<img src={firstMap.v ? map1 : map2} alt="Карта" />
			</div>
			<div className={styles.btns}>
				<button onClick={firstMap.setT} className={firstMap.v ? styles.active : ""}>Этаж 1</button>
				<button onClick={firstMap.setF} className={!firstMap.v ? styles.active : ""}>Этаж 2</button>
			</div>
		</Layout>
	);
}
