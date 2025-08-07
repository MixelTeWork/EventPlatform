"use client"
import styles from "./page.module.css"
import { useTitle } from "@/utils/useTtile";
import useStateObj from "@/utils/useStateObj";
import StyledWindow from "@mCmps/StyledWindow";
import Textbox from "@mCmps/Textbox";

export default function Page()
{
	useTitle("Расписание");
	const timetable = useStateObj(0);
	const items = [
		data_timetable,
		data_autograph,
		data_lections,
		data_tournaments,
	][timetable.v];

	return (
		<div className={styles.root}>
			<StyledWindow className={styles.list} scrollUpdate={timetable.v}>
				<div className={styles.items}>
					{items.map((el, i) => el.isTitle ?
						<div className={styles.item_title} key={i}>{el.text}</div>
						:
						<Textbox small key={i}><div className={styles.item}>{el.text}</div></Textbox>
					)}
				</div>
			</StyledWindow>
			<div className={styles.btns}>
				<Textbox small btn highlight={timetable.v == 0}>
					<button onClick={() => timetable.set(0)} className={styles.btn}>Сцены</button>
				</Textbox>
				{/* <Textbox small btn highlight={timetable.v == 1}>
						<button onClick={() => timetable.set(1)} className={styles.btn}>Автограф</button>
					</Textbox>
					<Textbox small btn highlight={timetable.v == 2}>
						<button onClick={() => timetable.set(2)} className={styles.btn}>Лекции</button>
					</Textbox> */}
				<Textbox small btn highlight={timetable.v == 3}>
					<button onClick={() => timetable.set(3)} className={styles.btn}>Турниры</button>
				</Textbox>
			</div>
		</div>
	);
}

interface TimetableData
{
	text: string;
	isTitle?: boolean;
}

const data_timetable: TimetableData[] = [
	{ text: "Главная сцена:", isTitle: true },
	{ text: "12:50 - Открытие" },
	{ text: "13:00 - Шима Нори - Undertale на рояле" },
	{ text: "13:30 - Косплей дефиле блок 1" },
	{ text: "14:00 - Музыкальный блок гостей" },
	{ text: "14:30 - Косплей дефиле блок 2" },
	{ text: "15:00 - Музыкальный блок участников" },
	{ text: "15:30 - Аукцион" },
	{ text: "16:00 - Выступление Empire of Geese" },
	{ text: "17:00 - Underevent презентация" },
	{ text: "17:30 - Голосование за лучшего Санса" },
	{ text: "18:00 - Награждение" },
	{ text: "18:40 - Блок анимаций" },
	{ text: "19:40 - Закрытие" },
	{ text: "Малая сцена:", isTitle: true },
	{ text: "12:00 - Ответы на вопросы от ютуберов" },
	{ text: "12:40 - Лотерея" },
	{ text: "13:00 - Undertale Quiz AU" },
	{ text: "13:30 - Jackbox с ютуберами" },
	{ text: "14:20 - WonderNope автограф сессия" },
	{ text: "14:40 - Игорь Чай автограф сессия" },
	{ text: "15:00 - Лотерея" },
	{ text: "15:10 - Марсильез автограф сессия" },
	{ text: "15:30 - Предпоказ песни FolkStudio" },
	{ text: "15:40 - Sirus и Folkstudio автограф сессия" },
	{ text: "16:00 - презентация игры Insult Goatbro" },
	{ text: "16:10 - InkBlot презентация вселенной и автограф сессия" },
	{ text: "16:40 - Undertale quiz original" },
	{ text: "17:00 - Лотерея" },
	{ text: "17:30 - Marina aka mari презентация вселенной Kamitale" },
	{ text: "17:50 - Sansация Презентация фильма" },
	{ text: "18:00 - Итоги конкурсов маркета" },
	{ text: "18:10 - Everybody 1-2 switch" },
	{ text: "19:00 - Дискотека" },
	{ text: "19:50 - Закрытие" },
];

const data_autograph: TimetableData[] = [
	{ text: "13:30 - АнтиКек" },
	{ text: "14:00 - Бемон" },
	{ text: "14:30 - JF Voice и FolkStudio" },
	{ text: "15:00 - Неадекват Рекордс" },
	{ text: "15:30 - WonderNope" },
	{ text: "16:00 - Игорь Чай (тв)" },
	{ text: "16:30 - Щищ (игра в Uno)" },
];

const data_lections: TimetableData[] = [
	{ text: "13:00 - О франшизе Hylics" },
	{ text: "13:40 - Инди игры как искусство" },
	{ text: "14:10 - Как найти ✨ту самую✨ идею для игры" },
	{ text: "14:40 - Краудфандинг авторской игры" },
	{ text: "15:20 - Что такое Touhou Project и как его употреблять?" },
	{ text: "16:00 - Производственный ад в игровой индустрии" },
	{ text: "16:40 - Анализ игр для гейм-дизайнеров и обзорщиков" },
];

const data_tournaments: TimetableData[] = [
	{ text: "Турниры:", isTitle: true },
	{ text: "Unfair Undyne 11:00 - 17:30" },
	{ text: "Endless Sans 11:00 - 17:30" },
	{ text: "Underverse Battles 14:00" },
	{ text: "Ретро турниры:", isTitle: true },
	{ text: "Sega - Ultimate Mortal Combat 3 - 13:00" },
	{ text: "Ps 1 - Tekken 3 - 15:00" },
	{ text: "Snes - Super Tetris 3 - 17:00" },
]
