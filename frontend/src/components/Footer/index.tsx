import { Link } from "react-router-dom";
import styles from "./styles.module.css"

export default function Footer({ curPage }: FooterProps)
{
	return (
		<div className={styles.root}>
			{curPage != "map" && <Link to={"/"}>Карта</Link>}
			{curPage != "timetable" && <Link to={"/timetable"}>Расписание</Link>}
			{curPage != "quest" && <Link to={"/quest"}>Квесты</Link>}
			{curPage != "store" && <Link to={"/store"}>Магазин</Link>}
			{/* {curPage != "race" && <Link to={"/race"}>Гонки</Link>} */}
		</div>
	);
}

interface FooterProps
{
	curPage?: "map" | "timetable" | "quest" | "store" | "race"
}
