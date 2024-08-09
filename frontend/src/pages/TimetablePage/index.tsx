import styles from "./styles.module.css"
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import useStateBool from "../../utils/useStateBool";
import StyledWindow from "../../components/StyledWindow";
import { useTitle } from "../../utils/useTtile";

export default function TimetablePage()
{
	useTitle("Расписание");
	const showTimetable = useStateBool(true);
	const showTimetableFirst = useStateBool(true);
	const showTurnamentFirst = useStateBool(true);

	return (
		<Layout centeredPage className={styles.root} footer={<Footer curPage="timetable" />}>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.body}>
				{showTimetable.v ?
					<StyledWindow
						className={styles.list}
						title={"Расписание | " + (showTimetableFirst.v ? "Главная" : "Вторая") + " сцена"}
						footer={
							<div className={styles.btns}>
								<button onClick={showTimetableFirst.setT} className={showTimetableFirst.v ? styles.active : ""}>Главная</button>
								<button onClick={showTimetableFirst.setF} className={!showTimetableFirst.v ? styles.active : ""}>Вторая</button>
							</div>
						}
					>
						<div className={styles.items}>
							{(showTimetableFirst.v ? data_timetable_first : data_timetable_second)
								.map((el, i) => <div key={i}>{el}</div>)}
						</div>
					</StyledWindow>
					:
					<StyledWindow
						className={styles.list}
						title={"Турниры | " + (showTurnamentFirst.v ? "Under" : "Ретро")}
						footer={
							<div className={styles.btns}>
								<button onClick={showTurnamentFirst.setT} className={showTurnamentFirst.v ? styles.active : ""}>Under</button>
								<button onClick={showTurnamentFirst.setF} className={!showTurnamentFirst.v ? styles.active : ""}>Ретро</button>
							</div>
						}
					>
						<div className={styles.items}>
							{(showTurnamentFirst.v ? data_turnament_first : data_turnament_second)
								.map((el, i) => <div key={i}>{el}</div>)}
						</div>
					</StyledWindow>
				}
				<div className={styles.btns}>
					<button onClick={showTimetable.setT} className={showTimetable.v ? styles.active : ""}>План</button>
					<button onClick={showTimetable.setF} className={!showTimetable.v ? styles.active : ""}>Турнир</button>
				</div>
			</div>
		</Layout>
	);
}

const data_timetable_first = [
	"12:50 - Церемония открытия",
	"13:00 - Shima Nori Piano Performance",
	"13:45 - Косплей дефиле",
	"14:45 - СлуЧайность",
	"15:30 - Аукцион",
	"16:00 - UnderEvent и результаты Game Jam",
	"16:30 - Гонки улиток",
	"17:00 - Музыкальные выступления",
	"17:30 - Финал турниров: Undercards & UV Battles",
	"18:30 - Награждение",
	"19:00 - Undertale Анимации",
	"19:55 - Закрытие сцены",
]

const data_timetable_second = [
	"12:00 - Ответы на вопросы от Ютуберов",
	"12:40 - Лотерея",
	"13:00 - The Jackbox Party Pack с Ютуберами",
	"14:00 - Undertale Quiz",
	"14:30 - 84 Sans AU Quiz",
	"15:00 - Лотерея",
	"15:30 - Презентации Undertale AU",
	"16:30 - Презентации Игр",
	"17:30 - Лотерея",
	"18:00 - Everybody Switch",
	"19:00 - Дискотека",
	"19:55 - Закрытие сцены",
]

const data_turnament_first = [
	"14:00 - Undercards",
	"15:00 - Underverse Battles",
	"11:30 - 17:00 - Endless Sans",
	"11:30 - 17:00 - Unfair Undyne",
]

const data_turnament_second = [
	"13:00 - Nes - TMNT: Tournament Fighters",
	"14:00 - Sega - Ultimate Mortal Kombat 3",
	"15:00 - Snes - Super Tetris 3",
	"16:00 - Ps1 - Tekken 3",
]
