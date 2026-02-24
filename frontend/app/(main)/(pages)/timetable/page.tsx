"use client"
import styles from "./page.module.css"
import { useTitle } from "@/utils/useTtile";
import useStateObj from "@/utils/useStateObj";
import StyledWindow from "@mCmps/StyledWindow";
import Textbox from "@mCmps/Textbox";
import Textbox2 from "@mCmps/Textbox2";

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
						<Textbox2 small darkbg key={i}><div className={styles.item}>{el.text}</div></Textbox2>
					)}
				</div>
			</StyledWindow>
			<div className={styles.btns}>
				<Textbox2 small btn highlight={timetable.v == 0}>
					<button onClick={() => timetable.set(0)} className={styles.btn}>Сцены</button>
				</Textbox2>
				{/* <Textbox2 small btn highlight={timetable.v == 1}>
					<button onClick={() => timetable.set(1)} className={styles.btn}>Зоны</button>
				</Textbox2> */}
				<Textbox2 small btn highlight={timetable.v == 2}>
					<button onClick={() => timetable.set(2)} className={styles.btn}>Турниры</button>
				</Textbox2>
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
	{ text: "12:20 - Открытие" },
	{ text: "12:30 - Shima Nori piano performance" },
	{ text: "13:00 - Косплей дефиле блок 1" },
	{ text: "13:30 - Выступление Sirus, Firever, Neykas, JF Voice" },
	{ text: "14:00- Выступление SayMaxWell" },
	{ text: "14:30 - Музыкальный блок" },
	{ text: "15:00- Аукцион" },
	{ text: "15:10 - ?Секретные гости?" },
	{ text: "15:50 - Презентация Underverse Battles" },
	{ text: "16:00 - Выступление Miatriss" },
	{ text: "16:30 - Косплей дефиле блок 2" },
	{ text: "17:00 - ?Секретные гости?" },
	{ text: "17:45 - Выступление Хлоя" },
	{ text: "18:00 - Голосование лучший персонаж Deltarune" },
	{ text: "18:30 - Награждение" },
	{ text: "19:00 - Анимации" },
	{ text: "Малая сцена:", isTitle: true },
	{ text: "12:00 - Ответы на вопросы от ютуберов" },
	{ text: "12:30 - Лотерея 1" },
	{ text: "12:40 - Презентация Charatale" },
	{ text: "13:00 - Автограф сессия ВондерНоуп, Инкблот, Марсильез" },
	{ text: "13:30 - Квиз" },
	{ text: "14:00 - Презентация Cozy Inn" },
	{ text: "14:30 - Лотерея 2" },
	{ text: "14:40 - Презентация IGB Team" },
	{ text: "15:10 - Автограф сессия Sirus, FolkStudio, JF Voice" },
	{ text: "15:40 - Презентация UT Traitor" },
	{ text: "16:00 - 1-2 switch" },
	{ text: "17:00 - Автограф сессия Миатрисс, Максвелл" },
	{ text: "17:30 - Лотерея 3" },
	{ text: "17:45 - ?Секретные гости?" },
	{ text: "18:15 - Розыгрыш квест маркет, аукцион картонных фигур" },
	{ text: "18:30 - Дискотека" },
	{ text: "19:30 - Закрытие" },
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
	{ text: "Турниры:", isTitle: true },
	{ text: "Ralsey Hwrot c 11 до 17 (на счёт)" },
	{ text: "Endless Sans 0.68 c 11 до 17 (на счёт)" },
	{ text: "Unfair Undyne 0.99 c 11 до 17 (на счёт)" },
	{ text: "Underverse Battles - 14:00" },
	{ text: "Ретро турниры:", isTitle: true },
	{ text: "Guilty Gear X2 Reload - 13:00" },
	{ text: "Mortal Kombat 3 Ultimate - 15:00" },
	{ text: "Tetris Game Boy - 17:00" },
	{ text: "Настольные турниры:", isTitle: true },
	{ text: "Undercards - 14:00" },
]
