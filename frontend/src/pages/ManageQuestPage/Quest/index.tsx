import { useEffect } from "react";
import PopupConfirm from "../../../components/PopupConfirm";
import Spinner from "../../../components/Spinner";
import classNames from "../../../utils/classNames";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import { useMutationEditQuest, useMutationDeleteQuest, type QuestFull } from "../../../api/quest";
import IconDelete from "../../../icons/delete";
import IconSave from "../../../icons/save";
import IconCancel from "../../../icons/cancel";
import Popup from "../../../components/Popup";

export default function Quest({ quest }: QuestProps)
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const popupOpen = useStateBool(false);
	const name = useStateObj(quest.name, changed.setT);
	const reward = useStateObj(quest.reward, changed.setT);
	const hidden = useStateBool(quest.hidden, changed.setT);
	const description = useStateObj(quest.description, changed.setT);

	const mutationEdit = useMutationEditQuest(quest.id, reset, () => reset());

	function reset(newQuest?: QuestFull)
	{
		name.set(newQuest?.name || quest.name);
		reward.set(newQuest?.reward || quest.reward);
		hidden.set(newQuest?.hidden || quest.hidden);
		description.set(newQuest?.description || quest.description);
		changed.setF();
	}

	// eslint-disable-next-line
	useEffect(reset, [quest])

	return (
		<div className={classNames(styles.root, changed.v && styles.changed)}>
			{mutationEdit.isLoading && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationEdit.reset()}>ОК</button>
			</div>)}
			<PopupConfirm title={"Удалить товар: " + name.v} itemId={quest.id} mutationFn={useMutationDeleteQuest} open={deleting.v} close={deleting.setF} />
			<div className={styles.id}>{quest.id}</div>
			<div className={styles.inputs}>
				<div>Название</div>
				<input type="text" value={name.v} onChange={inp => name.set(inp.target.value)} />
				<div>Награда</div>
				<input type="number" value={reward.v} onChange={inp => reward.set(inp.target.valueAsNumber)} />
				<span>Скрытый</span>
				<label className={styles.checkbox}>
					<input type="checkbox" checked={hidden.v} onChange={inp => hidden.set(inp.target.checked)} />
					<span></span>
				</label>
				<div>Описание</div>
				<button
					className={classNames(styles.description, description.v.length > 256 && styles.description_count_too_many)}
					onClick={popupOpen.setT}
				>
					{description.v}
				</button>
			</div>
			<div className={classNames("material_symbols", styles.buttons)}>
				{!changed.v && <button onClick={deleting.setT}><IconDelete /></button>}
				{changed.v && <button

					onClick={() =>
					{
						mutationEdit.mutate({
							name: name.v,
							description: description.v,
							reward: reward.v,
							hidden: hidden.v,
						});
					}}
				>
					<IconSave />
				</button>}
				{changed.v && <button onClick={() => reset()}><IconCancel /></button>}
			</div>
			<Popup title="Редактирование квеста" open={popupOpen.v} close={popupOpen.setF}>
				<h2>Описание квеста {name.v}</h2>
				<textarea
					className={styles.textarea}
					cols={40}
					rows={10}
					value={description.v}
					onChange={inp => description.set(inp.target.value)}
				/>
				<div className={styles.description_count}>
					<span>
						<span className={description.v.length > 256 ? styles.description_count_too_many : ""}>{description.v.length}</span>
						<span>/256</span>
					</span>
				</div>
			</Popup>
		</div>
	);
}

interface QuestProps
{
	quest: QuestFull
}