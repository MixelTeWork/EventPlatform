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
		data_zones,
		data_tournaments,
	][timetable.v];

	return (
		<div className={styles.root}>
			<StyledWindow className={styles.list} scrollUpdate={timetable.v}
				title={"timetable/" + ["scenes", "zones", "tournaments"][timetable.v]}
			>
				<div className={styles.items}>
					{items.map((el, i) => el.isTitle ?
						<div className={styles.item_title} key={i}>{el.text}</div>
						:
						<Textbox small darkbg key={i}><div className={styles.item}>{el.text}</div></Textbox>
					)}
				</div>
			</StyledWindow>
			<div className={styles.btns}>
				<Textbox small btn highlight={timetable.v == 0}>
					<button onClick={() => timetable.set(0)} className={styles.btn}>Сцены</button>
				</Textbox>
				<Textbox small btn highlight={timetable.v == 1}>
					<button onClick={() => timetable.set(1)} className={styles.btn}>Зоны</button>
				</Textbox>
				<Textbox small btn highlight={timetable.v == 2}>
					<button onClick={() => timetable.set(2)} className={styles.btn}>Турниры</button>
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
	{ text: "12:30 - Ответы на вопросы от ютуберов" },
	{ text: "13:00 - Открытие" },
	{ text: "13:15 - Косплей дефиле блок 1" },
	{ text: "14:00 - Предпоказ видео FolkStudio" },
	{ text: "14:05 - Penka Omori Performance" },
	{ text: "14:10 - Предпоказ клипа DTV animation" },
	{ text: "14:15 - Предпоказ аниматика Антикек" },
	{ text: "14:30 - Эпик Мюзикл" },
	{ text: "14:45 - Предпоказ проекта BIB Production" },
	{ text: "15:00 - Аукцион" },
	{ text: "15:15 - Косплей Дефиле блок 2" },
	{ text: "16:00 - выступление SayMaxWell" },
	{ text: "16:30 - Выступление музыкальных групп" },
	{ text: "17:30 - голосование за лучшую инди игру" },
	{ text: "18:00 - Награждение косплея" },
	{ text: "18:30 - Анимации" },
	{ text: "19:30 - закрытие сцены" },
	{ text: "Малая сцена:", isTitle: true },
	{ text: `12:30 - Открытие сцены` },
	{ text: `12:45 - Розыгрыш` },
	{ text: `13:00 - Инди Квиз` },
	{ text: `13:30 - Лекция "Как геймдизайнеру (не) подсказывать игроку, что делать. Аффорданс."` },
	{ text: `14:00 - Презентации разработчиков` },
	{ text: `14:45 - Розыгрыш` },
	{ text: `15:00 - Лекция Game4Art` },
	{ text: `15:30 - Лекция "Проведу за руку в мир гейм-дизайна"` },
	{ text: `16:00 - Презентации разработчиков` },
	{ text: `16:45 - Розыгрыш` },
	{ text: `17:00 - Лекция "Игры как искусство: Инструкция по применению"` },
	{ text: `17:30 - Лекция "Как и какие  инструменты ИИ могут сэкономить время"` },
	{ text: `18:00 - Everybody 1-2 switch` },
	{ text: `18:15 - Награждение квест-маркета` },
	{ text: `18.30 - Пиньята` },
	{ text: `19:00 - Дискотека` },
];

const data_zones: TimetableData[] = [
	{ text: "Автограф зона:", isTitle: true },
	{ text: "13:00 - Уголок Акра" },
	{ text: "14:00 - SayMaxWell" },
	{ text: "15:00 - N-time (онлайн)" },
	{ text: "16:00 - Антикек" },
	{ text: "17:00 - FolkStudio, SiRus" },
	{ text: "18:00 - DTV (онлайн)" },
	{ text: "Вип зона:", isTitle: true },
	{ text: "12:00 - Cuphead мультсериал 1-4 серии" },
	{ text: "13:00 - JackBox - смертельная вечеринка 2" },
	{ text: "14:00 - Dead sells мультсериал 1-10 серии" },
	{ text: "15:20 - Cuphead мультсериал 5-8 серии" },
	{ text: "16:20 - JackBox - Смехлыст 3" },
	{ text: "17:20 - Индикросс 1-2 серии" },
	{ text: "18:30 - Короткометражка Rusty Lake" },
	{ text: "18:50 - Короткометражка Papers, please" },
];

const data_tournaments: TimetableData[] = [
	{ text: "Инди турниры:", isTitle: true },
	{ text: "13:00 - Rivals of Aether" },
	{ text: "15:00 - Gang Beasts" },
	{ text: "17:00 - Ultimate Chicken Horse" },
	{ text: "Ретро турниры:", isTitle: true },
	{ text: "13:00 - Аркадный Волейбол" },
	{ text: "15:00 - Super Tetris 3" },
	{ text: "17:00 - Mortal Kombat 3 Ultimate" },
	{ text: "Настольные турниры:", isTitle: true },
	{ text: "14:00 - Повелители токио" },
	{ text: "16:00 - Гномы вредители" },
]
