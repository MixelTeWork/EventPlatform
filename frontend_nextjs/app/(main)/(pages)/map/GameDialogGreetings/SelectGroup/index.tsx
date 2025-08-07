import styles from "./styles.module.css"
import error from "./error.png";
import ink from "./ink.png";
import { useMutationSetGroup } from "@/api/user";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import Image from "next/image";

export default function SelectGroup({ close }: SelectGroupProps)
{
	const setGroup = useMutationSetGroup(close);
	// Инка к сохранить, Эррора к уничтожить
	return (
		<div className={styles.root}>
			{setGroup.isPending && <Spinner />}
			<div className={styles.body}>
				<h1 className={styles.title}>Вселенную нужно:</h1>
				{displayError(setGroup, e => <>
					<h3 style={{ color: "tomato" }}>{e}</h3>
					<button className={styles.close} onClick={close}>Продолжить как гость</button>
				</>)}
				<div className={styles.grid}>
					<Image src={ink} alt="Инк" className={styles.grid__img1} />
					<button className={styles.grid__btn1} onClick={() => setGroup.mutate({ group: 1 })}>Сохранить</button>
					<Image src={error} alt="Эррор" className={styles.grid__img2} />
					<button className={styles.grid__btn2} onClick={() => setGroup.mutate({ group: 2 })}>Уничтожить</button>
				</div>
			</div>
		</div>
	);
}

interface SelectGroupProps
{
	close: () => void;
}
