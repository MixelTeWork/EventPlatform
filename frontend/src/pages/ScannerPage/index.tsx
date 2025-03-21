import { useNavigate } from "react-router-dom";
import useMutationScanner, { type ScannerRes } from "../../api/scanner";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Popup from "../../components/Popup";
import Scanner from "../../components/Scanner";
import StyledWindow from "../../components/StyledWindow";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"
import Title from "../../components/Title";
import Textbox from "../../components/Textbox";

export default function ScannerPage()
{
	useTitle("Сканер");
	const popupOpen = useStateBool(false);
	const res = useStateObj<ScannerRes | null>(null, popupOpen.setT);
	const navigate = useNavigate();

	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer />} homeBtn>
			{/* <div className={styles.background}></div> */}
			<StyledWindow title="QR-Активатор" disableScroll className={styles.body} onClose={() => navigate(-1)}>
				<Scanner
					useMutation={useMutationScanner}
					pause={popupOpen.v}
					onScan={scanned =>
					{
						const actions = ["quest_", "item_", "send_", "promote_"];
						for (const action of actions)
							if (scanned.startsWith(action))
								return { code: scanned };
						return null;
					}}
					formatMsg={r => ({
						"ok": "",
						"wrong": "Недействующий QR",
						"error": r.msg,
					}[r.res] ?? r.res)}
					onRes={r =>
					{
						if (r.res == "ok")
							res.set(r);
					}}
				/>
			</StyledWindow>
			<Popup title="Активировано" open={popupOpen.v} close={popupOpen.setF}>
				{res.v?.action == "quest" && <>
					<Title small text="Квест завершён!" />
					<br />
					<Textbox small className={styles.tb}>{res.v.msg}</Textbox>
					<br />
					<h2>
						<span>Награда: </span>
						<span className={styles.gold}>{res.v.value}М</span>
					</h2>
				</>}
				{res.v?.action == "store" && <>
					<Title small text="Куплено!" />
					<br />
					<Textbox small className={styles.tb}>{res.v.msg}</Textbox>
					<br />
					<h2>
						<span>Потрачено: </span>
						<span className={styles.gold}>{res.v.value}М</span>
					</h2>
				</>}
				{res.v?.action == "send" && <>
					<Title small text={res.v.value > 0 ? "Пополнено" : "Вычтено"} />
					<br />
					<h1 className={styles.gold}>{res.v.value > 0 ? "+" : ""}{res.v.value}М</h1>
				</>}
				{res.v?.action == "promote" && <>
					<Title small text="Назначение" />
					<br />
					<h2>Теперь вы {{
						"worker": "волонтёр",
						"manager": "управляющий",
					}[res.v.msg] || "неизвестно"}</h2>
				</>}
			</Popup>
		</Layout>
	);
}
