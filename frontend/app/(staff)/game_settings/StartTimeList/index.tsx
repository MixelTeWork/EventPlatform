import React, { useEffect } from "react"
import styles from "./styles.module.css"
import Button from "@sCmps/Button";
import Popup from "@/components/Popup";
import useStateBool from "@/utils/useStateBool";
import { useGameStartTimes, useMutationGameStartTimes } from "@/api/game";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import { useStateList } from "@/utils/useStateObj";
import Input from "@sCmps/Input";
import clsx from "@/utils/clsx";

export default function StartTimeList({ games }: { games: number | undefined })
{
	const opened = useStateBool(false, v => v && showSaved.setF());
	const showSaved = useStateBool(false);
	const confirmCancel = useStateBool(false);
	const startTimesQuery = useGameStartTimes();
	const mutation = useMutationGameStartTimes(() =>
	{
		opened.setF();
		confirmCancel.setF();
		showSaved.setT();
	});
	const startTimes = useStateList<string>([]);

	useEffect(() => startTimes.set(fillList(startTimesQuery.data, games)), [startTimesQuery.data, games]);

	const save = () => mutation.mutate(startTimes.v);

	return (
		<div className={styles.root}>
			<span>Время начала</span>
			<span className={styles.btn}>
				<Button text="Авто-список" calm padding onClick={opened.setT} />
				<span className={clsx(styles.saved, showSaved.v && styles.saved_visible)}>Сохранено!</span>
			</span>
			<Popup open={opened.v} title="Список времени начала игр" close={() =>
			{
				const savedData = fillList(startTimesQuery.data, games);
				const equal = savedData.reduce((pv, v, i) => pv && startTimes.v[i] == v, true);
				if (equal) opened.setF();
				else confirmCancel.setT();
			}}>
				{startTimesQuery.isLoading && <Spinner />}
				{mutation.isPending && <Spinner />}
				{displayError(startTimesQuery)}
				<div className={styles.hint}>Время начала будет автоматически меняться <b>после завершения игры</b>, если поле не пустое. Номер здесь означает не кол-во сыгранных игр, а какой по счёту победитель будет выбран в следующей игре</div>
				<div className={styles.list}>
					{startTimes.v.map((v, i) => <div key={i}>
						<span>{i + 1}: </span>
						{i == 0 ? <span style={{ fontSize: "0.9rem" }}>вручную</span> :
							<Input type="text" value={v} onChangeV={v => startTimes.setI(i, v.slice(0, 16))} />
						}
					</div>)}
					<Button text="Сохранить" padding={"0.25em"} calm onClick={save} />
				</div>
				<Popup openState={confirmCancel} title="Сохранить изменения?">
					<div className={styles.confirm}>
						<Button text="Нет" padding={"0.25em"} calm onClick={() =>
						{
							startTimes.set(fillList(startTimesQuery.data, games));
							opened.setF();
							confirmCancel.setF();
						}} />
						<Button text="Сохранить" padding={"0.25em"} onClick={save} />
					</div>
				</Popup>
			</Popup>
		</div>
	);
}
function fillList(values: string[] | undefined, len: number | undefined)
{
	return Array(len || 0).fill("").map((_, i) => values?.[i] || "");
}