import { Link } from "react-router-dom";
import styles from "./styles.module.css"

export default function Footer({ curPage = "" }: FooterProps)
{
	return (
		<div className={styles.root}>
			<div>
				<Link className={curPage == "map" ? styles.active : ""} to={"/"}>Карта</Link>
				<Link className={curPage == "timetable" ? styles.active : ""} to={"/timetable"}>План</Link>
				<Link className={curPage == "quest" ? styles.active : ""} to={"/quest"}>Квест</Link>
				<Link className={curPage == "store" ? styles.active : ""} to={"/store"}>Магаз</Link>
				<Link className={curPage == "race" ? styles.active : ""} to={"/race"}>Гонки</Link>
			</div>
		</div>
	);
}

interface FooterProps
{
	curPage?: "map" | "timetable" | "quest" | "store" | "race" | ""
}
