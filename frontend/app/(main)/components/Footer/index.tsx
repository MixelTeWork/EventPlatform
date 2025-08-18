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
				<Textbox small btn alterbg highlight={pathname == "/map"}>
					<Link className={styles.btn} href={"/map"}>Карта</Link>
				</Textbox>
				<Textbox small btn alterbg highlight={pathname == "/timetable"}>
					<Link className={styles.btn} href={"/timetable"}>План</Link>
				</Textbox>
				<Textbox small btn alterbg highlight={pathname == "/quests"}>
					<Link className={styles.btn} href={"/quests"}>Квест</Link>
				</Textbox>
				<Textbox small btn alterbg highlight={pathname == "/store"}>
					<Link className={styles.btn} href={"/store"}>Магаз</Link>
				</Textbox>
				<Textbox small btn alterbg highlight={pathname == "/game"}>
					<Link className={styles.btn} href={"/game"}>Бой</Link>
				</Textbox>
			</div>
		</div>
	);
}
