import styles from "./styles.module.css"
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import StyledWindow from "../../components/StyledWindow";
import { useTitle } from "../../utils/useTtile";
import useStateObj from "../../utils/useStateObj";
import Textbox from "../../components/Textbox";
import classNames from "../../utils/classNames";

export default function TimetablePage()
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
		<Layout centeredPage className={styles.root} footer={<Footer curPage="timetable" />}>
			<h1 className={classNames("title", styles.title)}>Underparty</h1>
			<div className={styles.body}>
				<StyledWindow className={styles.list} scrollUpdate={timetable.v}>
					<div className={styles.items}>
						{items.map((el, i) => el.title ?
							<div className={classNames("title", styles.item_title)} key={i}>{el.text}</div>
							:
							<Textbox dark key={i}><div className={styles.item}>{el.text}</div></Textbox>
						)}
					</div>
				</StyledWindow>
				<div className={styles.btns}>
					<Textbox small btn highlight={timetable.v == 0}>
						<button onClick={() => timetable.set(0)} className={classNames(styles.btn, "title")}>Сцены</button>
					</Textbox>
					<Textbox small btn highlight={timetable.v == 1}>
						<button onClick={() => timetable.set(1)} className={classNames(styles.btn, "title")}>Автограф</button>
					</Textbox>
					<Textbox small btn highlight={timetable.v == 2}>
						<button onClick={() => timetable.set(2)} className={classNames(styles.btn, "title")}>Лекции</button>
					</Textbox>
					<Textbox small btn highlight={timetable.v == 3}>
						<button onClick={() => timetable.set(3)} className={classNames(styles.btn, "title")}>Турниры</button>
					</Textbox>
				</div>
			</div>
		</Layout>
	);
}

interface TimetableData
{
	text: string;
	title?: boolean;
}

const data_timetable: TimetableData[] = [
	{ text: "Главная сцена:", title: true },
	{ text: "12:50 - Церемония открытия" },
	{ text: "13:00 - Музыкальные номера" },
	{ text: "13:30 - 1 блок косплей дефиле" },
	{ text: "14:00 - Shima Nori. Инди игры на фортепиано" },
	{ text: "14:30 - Аукцион" },
	{ text: "14:50 - Undertale Сценка: Underdogs" },
	{ text: "15:00 - 2 блок косплей дефиле" },
	{ text: "15:40 - Музыкальные номера" },
	{ text: "16:15 - Блок Анимации: АнтиКек, BDP, CornMayor" },
	{ text: "17:00 - Выступление музыкальных групп" },
	{ text: "18:10 - Финальная Битва" },
	{ text: "18:25 - Награждение" },
	{ text: "18:50 - Анимации" },
	{ text: "19:50 - Закрытие сцены" },
	{ text: "Малая сцена:", title: true },
	{ text: "12:00 - Ответы на вопросы от Ютуберов" },
	{ text: "12:40 - Лотерея" },
	{ text: "13:30 - QWIZ Инди хорроры" },
	{ text: "14:00 - EVRYBODY SWITCH" },
	{ text: "15:00 - Лотерея" },
	{ text: "15:30 - QWIZ пиксельные РПГ" },
	{ text: "16:00 - Турнир: Overcooked 2" },
	{ text: "16:40 - Турнир: Your Only Move Is HUSTLE" },
	{ text: "17:20 - Турнир: Rival of Aether" },
	{ text: "18:00 - Лотерея" },
	{ text: "18:45 - Дискотека" },
	{ text: "19:45 - Закрытие сцены" },
	{ text: "Инди Сцена:", title: true },
	{ text: "13:00 - Презентации инди-игр" },
	{ text: "14:00 - Презентации Game Jam" },
	{ text: "15:00 - Презентации инди-игр" },
	{ text: "16:00 - Результаты джема" },
	{ text: "16:30 - Презентации инди-игр" },
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
	{ text: "Инди Турниры (на малой сцене):", title: true },
	{ text: "16:00 - Overcooked 2" },
	{ text: "16:40 - Your Only Move Is HUSTLE" },
	{ text: "17:20 - Rival of Aether" },
	{ text: "Ретро Турниры (на гейм зоне):", title: true },
	{ text: "13:00 - Super Tetris 3" },
	{ text: "14:00 - Tekken 3" },
	{ text: "15:00 - Mortal Combat 3" },
]
