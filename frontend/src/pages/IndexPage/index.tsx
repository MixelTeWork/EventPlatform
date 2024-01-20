import styles from "./styles.module.css"
import map from "./map.png";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";

export default function IndexPage()
{
	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="map" />}>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.map}>
				<img src={map} alt="Карта" />
			</div>
		</Layout>
	);
}
