import { useMutationSetGroup } from "../../../api/user";
import displayError from "../../../utils/displayError";
import Spinner from "../../Spinner";
import styles from "./styles.module.css"

export default function SelectGroup({ close }: SelectGroupProps)
{
	const setGroup = useMutationSetGroup(close);

	return (
		<div className={styles.root}>
			{setGroup.isLoading && <Spinner />}
			<div className={styles.body}>
				<h2 className="title">Кому вы поможете?</h2>
				{displayError(setGroup, e => <>
					<h3 style={{ color: "tomato" }}>{e}</h3>
					<button className={styles.close} onClick={close}>Продолжить как гость</button>
				</>)}
				<div className={styles.grid}>
					<div className={styles.back}></div>
					<div className={styles.back}></div>
					<div></div>
					<button className="title" onClick={() => setGroup.mutate({ group: 1 })}>Персонажам</button>
					<button className="title" onClick={() => setGroup.mutate({ group: 2 })}>Разработчику</button>
					<div></div>
				</div>
			</div>
		</div>
	);
}

interface SelectGroupProps
{
	close: () => void;
}
