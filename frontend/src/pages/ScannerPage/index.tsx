import useMutationScanner from "../../api/scanner";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Scanner from "../../components/Scanner";
import StyledWindow from "../../components/StyledWindow";
import styles from "./styles.module.css"

export default function ScannerPage()
{
	return (
		<Layout centeredPage headerColor="#51185b" gap="1em" className={styles.root} footer={<Footer />}>
			<div className={styles.background}></div>
			<StyledWindow title="QR-Активатор" disableScroll className={styles.body}>
				<Scanner
					useMutation={useMutationScanner}
					onScan={scanned =>
					{
						return null;
					}}
					formatMsg={r => ({
						"ok": "",
						"wrong": "Недействующий QR",
						"error": "Произошла ошибка",
					}[r.res] ?? r.res)}
					onRes={res =>
					{
						
					}}
				/>
			</StyledWindow>
		</Layout>
	);
}
