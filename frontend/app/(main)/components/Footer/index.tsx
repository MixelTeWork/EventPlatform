"use client"
import styles from "./styles.module.css"
import Link from "next/link";
import Textbox from "@mCmps/Textbox";
import { usePathname } from "next/navigation";

export default function Footer()
{
	const pathname = usePathname()
	return (
		<div className={styles.root}>
			<div>
				<Textbox small btn highlight={pathname == "/map"}>
					<Link className={styles.btn} href={"/map"}>Карта</Link>
				</Textbox>
				<Textbox small btn highlight={pathname == "/timetable"}>
					<Link className={styles.btn} href={"/timetable"}>План</Link>
				</Textbox>
				<Textbox small btn highlight={pathname == "/store"}>
					<Link className={styles.btn} href={"/store"}>Магаз</Link>
				</Textbox>
				<Textbox small btn highlight={pathname == "/game"}>
					<Link className={styles.btn} href={"/game"}>Бой</Link>
				</Textbox>
			</div>
		</div>
	);
}
