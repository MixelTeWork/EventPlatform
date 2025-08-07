"use client"
import styles from "./page.module.css"
import { useRouter } from "next/navigation";
import { useTitle } from "@/utils/useTtile";
import useStateBool from "@/utils/useStateBool";
import useStateObj from "@/utils/useStateObj";
import Popup from "@/components/Popup";
import StyledWindow from "@mCmps/StyledWindow";
import Textbox from "@mCmps/Textbox";
import Title from "@mCmps/Title";
import { useMutationScanner, type ScannerRes } from "@/api/scanner";
import Scanner from "./Scanner";

export default function Page()
{
	useTitle("Сканер");
	const popupOpen = useStateBool(false);
	const res = useStateObj<ScannerRes | null>(null, popupOpen.setT);
	const router = useRouter();

	return (<>
		{/* <div className={styles.background}></div> */}
		<StyledWindow title="QR-Активатор" className={styles.body} onClose={() => router.back()}>
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
				<Title text="Квест завершён!" />
				<br />
				<Textbox small className={styles.tb}>{res.v.msg}</Textbox>
				<br />
				<h2>
					<span>Награда: </span>
					<span className={styles.gold}>{res.v.value}М</span>
				</h2>
			</>}
			{res.v?.action == "store" && <>
				<Title text="Куплено!" />
				<br />
				<Textbox small className={styles.tb}>{res.v.msg}</Textbox>
				<br />
				<h2>
					<span>Потрачено: </span>
					<span className={styles.gold}>{res.v.value}М</span>
				</h2>
			</>}
			{res.v?.action == "send" && <>
				<Title text={res.v.value > 0 ? "Пополнено" : "Вычтено"} />
				<br />
				<h2 className={styles.gold}>{res.v.value > 0 ? "+" : ""}{res.v.value}М</h2>
			</>}
			{res.v?.action == "promote" && <>
				<Title text="Назначение" />
				<br />
				<h2>Теперь вы {{
					"worker": "волонтёр",
					"manager": "управляющий",
				}[res.v.msg] || "неизвестно"}</h2>
			</>}
		</Popup>
	</>);
}
