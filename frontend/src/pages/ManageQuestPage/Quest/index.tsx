import { Fragment, useEffect } from "react";
import PopupConfirm from "../../../components/PopupConfirm";
import Spinner from "../../../components/Spinner";
import classNames from "../../../utils/classNames";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj, { type StateObj } from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import { useMutationEditQuest, useMutationDeleteQuest, type QuestFull } from "../../../api/quest";
import IconDelete from "../../../icons/delete";
import IconSave from "../../../icons/save";
import IconCancel from "../../../icons/cancel";
import Popup from "../../../components/Popup";
import IconEdit from "../../../icons/edit";
import IconView from "../../../icons/view";
import useGameDialog from "../../../components/GameDialog";
import IconReload from "../../../icons/reload";
import { createEmptyDialog, useDialog, type Dialog, type GameDialogData } from "../../../api/dialog";
import useGameDialogEditor from "../../../components/GameDialogEditor";
import type { UseQueryResult } from "react-query";

export default function Quest({ quest }: QuestProps)
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const popupOpen = useStateBool(false);
	const name = useStateObj(quest.name, changed.setT);
	const reward = useStateObj(quest.reward, changed.setT);
	const hidden = useStateBool(quest.hidden, changed.setT);
	const description = useStateObj(quest.description, changed.setT);

	const dialog1Id = useStateObj(quest.dialog1Id, changed.setT);
	const dialog2Id = useStateObj(quest.dialog2Id, changed.setT);
	const dialog1DataQuery = useDialog(dialog1Id.v ?? -1, false);
	const dialog2DataQuery = useDialog(dialog2Id.v ?? -1, false);
	const dialog1Data = useStateObj<GameDialogData | null>(null);
	const dialog2Data = useStateObj<GameDialogData | null>(null);

	const dialog = useGameDialog();
	const editor = useGameDialogEditor();
	const mutationEdit = useMutationEditQuest(quest.id, reset, () => reset());

	// eslint-disable-next-line
	useEffect(reset, [quest])

	function reset(newQuest?: QuestFull)
	{
		const data = newQuest || quest;
		name.set(data.name);
		reward.set(data.reward);
		hidden.set(data.hidden);
		description.set(data.description);
		dialog1Id.set(data.dialog1Id);
		dialog2Id.set(data.dialog2Id);
		dialog1Data.set(null);
		dialog2Data.set(null);
		changed.setF();
	}

	async function getDialog(state: StateObj<GameDialogData | null>, query: UseQueryResult<Dialog, unknown>, fn: (dialog: GameDialogData) => void)
	{
		if (state.v) fn(state.v);
		else if (query.isSuccess)
		{
			state.set(query.data.data)
			fn(query.data.data);
		}
		else if (query.isIdle || query.isError)
		{
			const d = await query.refetch();
			if (d.isSuccess)
			{
				state.set(d.data.data)
				fn(d.data.data);
			}
		}
	}

	return (
		<div className={classNames(styles.root, changed.v && styles.changed)}>
			{dialog.el()}
			{editor.el()}
			{mutationEdit.isLoading && <Spinner block r="0.5rem" />}
			{dialog1DataQuery.isLoading && <Spinner block r="0.5rem" />}
			{dialog2DataQuery.isLoading && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationEdit.reset()}>ОК</button>
			</div>)}
			<PopupConfirm title={"Удалить квест: " + name.v} itemId={quest.id} mutationFn={useMutationDeleteQuest} open={deleting.v} close={deleting.setF} />
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
				{[
					{ n: 1, questId: quest.dialog1Id, id: dialog1Id, data: dialog1Data, query: dialog1DataQuery },
					{ n: 2, questId: quest.dialog2Id, id: dialog2Id, data: dialog2Data, query: dialog2DataQuery },
				].map(({ n, questId, id, data, query }) => <Fragment key={n}>
					<div>Диалог {n}</div>
					<div className={classNames(styles.buttons, styles.dialogBtns)}>
						{id.v == null ? <>
							{!data.v && questId == null ?
								<button onClick={() =>
								{
									id.set(-1);
									data.set(createEmptyDialog());
								}}>+</button>
								:
								<button onClick={() => id.set(questId ?? -1)}><IconReload /></button>
							}
						</> : <>
							<button onClick={() => getDialog(data, query, dialog.runLocal)}><IconView /></button>
							<button onClick={() => getDialog(data, query, d => { changed.setT(); editor.open(d); })}><IconEdit /></button>
							<button onClick={() => id.set(null)}><IconDelete /></button>
						</>}
						{query.isError && <div style={{ color: "tomato" }}>Ошибка</div>}
					</div>
				</Fragment>)}
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
				<h2>Описание квеста "{name.v}"</h2>
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