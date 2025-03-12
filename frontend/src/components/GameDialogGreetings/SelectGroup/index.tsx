import { useMutationSetGroup } from "../../../api/user";
import displayError from "../../../utils/displayError";
import Spinner from "../../Spinner";
import Title from "../../Title";
import styles from "./styles.module.css"
import error from "./error.png";
import ink from "./ink.png";
import classNames from "../../../utils/classNames";

export default function SelectGroup({ close }: SelectGroupProps)
{
	const setGroup = useMutationSetGroup(close);
	// Инка к сохранить, Эррора к уничтожить
	return (
		<div className={styles.root}>
			{setGroup.isLoading && <Spinner />}
			<div className={styles.body}>
				<Title text="Вселенную нужно" />
				{displayError(setGroup, e => <>
					<h3 style={{ color: "tomato" }}>{e}</h3>
					<button className={styles.close} onClick={close}>Продолжить как гость</button>
				</>)}
				<div className={styles.grid}>
					<img src={ink} alt="Инк" className={styles.grid__img1} />
					<button className={classNames(styles.grid__btn1, "clearBtn")} onClick={() => setGroup.mutate({ group: 1 })}>Сохранить</button>
					<img src={error} alt="Эррор" className={styles.grid__img2} />
					<button className={classNames(styles.grid__btn2, "clearBtn")} onClick={() => setGroup.mutate({ group: 2 })}>Уничтожить</button>
				</div>
			</div>
		</div>
	);
}

interface SelectGroupProps
{
	close: () => void;
}
