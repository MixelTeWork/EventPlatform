import styles from "./styles.module.css"
import { Fragment, useEffect } from "react";
import useStateBool from "@/utils/useStateBool";
import useStateObj, { useStateObjNull } from "@/utils/useStateObj";
import clsx from "@/utils/clsx";
import displayError from "@/utils/displayError";
import useGameDialog from "@/components/GameDialog";
import Spinner from "@/components/Spinner";
import Popup from "@/components/Popup";
import PopupConfirm from "@sCmps/PopupConfirm";
import { createEmptyDialog, useDialog, type GameDialogData } from "@/api/dialog";
import { useMutationQuestDelete, useMutationQuestEdit, type QuestFull } from "@/api/quest";
import IconReload from "@icons/reload";
import IconView from "@icons/view";
import IconEdit from "@icons/edit";
import IconDelete from "@icons/delete";
import IconSave from "@icons/save";
import IconCancel from "@icons/cancel";
import Button from "@sCmps/Button";
import Input from "@sCmps/Input";
import Checkbox from "@sCmps/Checkbox";
import Textarea from "@sCmps/Textarea";
import getDialog from "../getDialog";
import useGameDialogEditor from "@sCmps/GameDialogEditor";

export default function Quest({ quest }:
	{
		quest: QuestFull
	})
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const popupOpen = useStateBool(false);
	const name = useStateObj(quest.name, changed.setT);
	const reward = useStateObj(quest.reward, changed.setT);
	const hidden = useStateBool(quest.hidden, changed.setT);
	const description = useStateObj(quest.description, changed.setT);

	const dialog1Id = useStateObjNull(quest.dialog1Id, changed.setT);
	const dialog2Id = useStateObjNull(quest.dialog2Id, changed.setT);
	const dialog1DataQuery = useDialog(dialog1Id.v ?? -1, false);
	const dialog2DataQuery = useDialog(dialog2Id.v ?? -1, false);
	const dialog1Data = useStateObjNull<GameDialogData>();
	const dialog2Data = useStateObjNull<GameDialogData>();
	const dialog1Changed = useStateBool(false, changed.setT);
	const dialog2Changed = useStateBool(false, changed.setT);

	const dialog = useGameDialog();
	const editor = useGameDialogEditor();
	const mutationEdit = useMutationQuestEdit(quest.id, reset, () => reset());

	// eslint-disable-next-line
	useEffect(reset, [quest])

	function reset(newQuest?: QuestFull)
	{
		const data = newQuest || quest;
		name.setSilent(data.name);
		reward.setSilent(data.reward);
		hidden.setSilent(data.hidden);
		description.setSilent(data.description);
		dialog1Id.setSilent(data.dialog1Id);
		dialog2Id.setSilent(data.dialog2Id);
		dialog1Data.setSilent(null);
		dialog2Data.setSilent(null);
		dialog1Changed.setSilent(false);
		dialog2Changed.setSilent(false);
		changed.setF();
	}

	return (
		<div className={clsx(styles.root, changed.v && styles.changed)}>
			{dialog.el()}
			{editor.el()}
			{mutationEdit.isPending && <Spinner block r="0.5rem" />}
			{dialog1DataQuery.isFetching && <Spinner block r="0.5rem" />}
			{dialog2DataQuery.isFetching && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<Button text="ОК" onClick={() => mutationEdit.reset()} padding />
			</div>)}
			<PopupConfirm title={"Удалить квест: " + name.v} itemId={quest.id} mutationFn={useMutationQuestDelete} open={deleting.v} close={deleting.setF} />
			<div className={styles.id}>{quest.id}</div>
			<div className={styles.inputs}>
				<div>Название</div>
				<Input type="text" stateObj={name} />
				<div>Награда</div>
				<Input type="number" stateObj={reward} />
				<span>Скрытый</span>
				<Checkbox className={styles.checkbox} stateObj={hidden} />
				<div>Описание</div>
				<button
					className={clsx(styles.description, description.v.length > 512 && styles.description_count_too_many)}
					onClick={popupOpen.setT}
				>
					{description.v}
				</button>
				{[
					{ n: 1, questId: quest.dialog1Id, id: dialog1Id, data: dialog1Data, query: dialog1DataQuery, changed: dialog1Changed },
					{ n: 2, questId: quest.dialog2Id, id: dialog2Id, data: dialog2Data, query: dialog2DataQuery, changed: dialog2Changed },
				].map(({ n, questId, id, data, query, changed }) => <Fragment key={n}>
					<div className={clsx(changed.v && styles.changedHighlight)}>Диалог {n}</div>
					<div className={clsx(styles.buttons, styles.dialogBtns)}>
						{id.v == null ? <>
							{!data.v && questId == null ?
								<Button text="+" className={styles.btnPlus} onClick={() =>
								{
									id.set(-1);
									data.set(createEmptyDialog());
								}} />
								:
								<Button text={<IconReload />} onClick={() => id.set(questId ?? -1)} />
							}
						</> : <>
							<Button text={<IconView />} onClick={() => getDialog(data, query, dialog.runLocal)} />
							<Button text={<IconEdit />} onClick={() => getDialog(data, query, d => { changed.setT(); editor.open(d); })} />
							<Button text={<IconDelete />} onClick={id.setNull} />
						</>}
						{query.isError && <div style={{ color: "tomato" }}>Ошибка</div>}
					</div>
				</Fragment>)}
			</div>
			<div className={styles.buttons}>
				{!changed.v && <Button text={<IconDelete />} onClick={deleting.setT} />}
				{changed.v && <Button
					text={<IconSave />}
					onClick={() => mutationEdit.mutate({
						name: name.v,
						description: description.v,
						reward: reward.v,
						hidden: hidden.v,
						dialog1: (quest.dialog1Id != null && dialog1Id.v == null) ? { __delete__: true } : (dialog1Changed.v && dialog1Data.v) || undefined,
						dialog2: (quest.dialog2Id != null && dialog2Id.v == null) ? { __delete__: true } : (dialog2Changed.v && dialog2Data.v) || undefined,
					})}
				/>}
				{changed.v && <Button text={<IconCancel />} onClick={() => reset()} />}
			</div>
			<Popup title="Редактирование квеста" openState={popupOpen}>
				<h2>{`Описание квеста "${name.v}"`}</h2>
				<Textarea cols={40} rows={10} stateObj={description} />
				<div className={styles.description_count}>
					<span>
						<span className={description.v.length > 512 ? styles.description_count_too_many : ""}>{description.v.length}</span>
						<span>/512</span>
					</span>
				</div>
			</Popup>
		</div>
	);
}
