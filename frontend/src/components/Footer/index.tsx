import { Link } from "react-router-dom";
import styles from "./styles.module.css"
import Textbox from "../Textbox";
import classNames from "../../utils/classNames";

export default function Footer({ curPage = "" }: FooterProps)
{
	return (
		<div className={styles.root}>
			<div>
				<Textbox small btn highlight={curPage == "map"}>
					<Link className={classNames(styles.btn, "title")} to={"/map"}>Карта</Link>
				</Textbox>
				<Textbox small btn highlight={curPage == "timetable"}>
					<Link className={classNames(styles.btn, "title")} to={"/timetable"}>План</Link>
				</Textbox>
				<Textbox small btn highlight={curPage == "store"}>
					<Link className={classNames(styles.btn, "title")} to={"/store"}>Магаз</Link>
				</Textbox>
				<Textbox small btn highlight={curPage == "game"}>
					<Link className={classNames(styles.btn, "title")} to={"/game"}>Игра</Link>
				</Textbox>
			</div>
		</div>
	);
}

interface FooterProps
{
	curPage?: "map" | "timetable" | "quest" | "store" | "game" | ""
}
