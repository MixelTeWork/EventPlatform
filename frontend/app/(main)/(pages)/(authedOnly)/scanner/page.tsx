"use client"
import styles from "./page.module.css"
import { useRouter } from "next/navigation";
import { useTitle } from "@/utils/useTtile";
import useStateBool from "@/utils/useStateBool";
import { useStateObjNull } from "@/utils/useStateObj";
import Popup from "@/components/Popup";
import StyledWindow from "@mCmps/StyledWindow";
import Textbox from "@mCmps/Textbox";
import Title from "@mCmps/Title";
import { useMutationScanner, type ScannerRes } from "@/api/scanner";
import Scanner from "./Scanner";
import Textbox2 from "@mCmps/Textbox2";

export default function Page()
{
	useTitle("Сканер");
	const popupOpen = useStateBool(false);
	const res = useStateObjNull<ScannerRes>(null, popupOpen.setT);
	const router = useRouter();

	// res.v = { action: "promote", balance: 10, msg: "staff", res: "ok", value: 1 };
	// res.v = { action: "quest", balance: 10, msg: "Поиск сокровища", res: "ok", value: 10 };
	// res.v = { action: "send", balance: 10, msg: "", res: "ok", value: 10 };
	// res.v = { action: "store", balance: 10, msg: "Утюг", res: "ok", value: 10 };

	return (<>
		{/* <div className={styles.background}></div> */}
		<StyledWindow noPad title="scanner" className={styles.body} onClose={() => router.back()}>
			<Scanner
				className={styles.scanner}
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
		<Popup title="Активировано" openState={popupOpen}>
			{res.v?.action == "quest" && <>
				<Title small text="Квест завершён!" />
				<br />
				<Textbox2 small className={styles.tb}><span>{res.v.msg}</span></Textbox2>
				<br />
				<h2>
					<span>Награда: </span>
					<span className={styles.gold}>{res.v.value}G</span>
				</h2>
			</>}
			{res.v?.action == "store" && <>
				<Title small text="Куплено!" />
				<br />
				<Textbox2 small className={styles.tb}><span>{res.v.msg}</span></Textbox2>
				<br />
				<h2>
					<span>Потрачено: </span>
					<span className={styles.gold}>{res.v.value}G</span>
				</h2>
			</>}
			{res.v?.action == "send" && <>
				<Title small text={res.v.value > 0 ? "Пополнено" : "Вычтено"} />
				<br />
				<h2 className={styles.gold}>{res.v.value > 0 ? "+" : ""}{res.v.value}М</h2>
			</>}
			{res.v?.action == "promote" && <>
				<Title small text="Назначение" />
				<br />
				<h2>Теперь вы {{
					"staff": "волонтёр",
					"manager": "управляющий",
				}[res.v.msg] || "неизвестно"}</h2>
			</>}
		</Popup>
	</>);
}
