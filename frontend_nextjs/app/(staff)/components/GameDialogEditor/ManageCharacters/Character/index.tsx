import styles from "./styles.module.css"
import { useEffect } from "react";
import { useMutationCharacterAdd, useMutationCharacterDelete, useMutationCharacterEdit, type GameDialogCharacter } from "@/api/dialog";
import IconCancel from "@icons/cancel";
import IconDelete from "@icons/delete";
import IconSave from "@icons/save";
import useStateBool from "@/utils/useStateBool";
import useStateObj, { useStateObjNull } from "@/utils/useStateObj";
import displayError from "@/utils/displayError";
import type { ImgData } from "@/api/dataTypes";
import clsx from "@/utils/clsx";
import Spinner from "@/components/Spinner";
import PopupConfirm from "@sCmps/PopupConfirm";
import Button from "@sCmps/Button";
import InputImage from "@sCmps/InputImage";
import Input from "@sCmps/Input";
import Select from "@sCmps/Select";

export default function Character({ character, deleteNew }: {
	character: GameDialogCharacter;
	deleteNew?: () => void,
})
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const id = useStateObj(character.id);
	const name = useStateObj(character.name, changed.setT);
	const imgData = useStateObjNull<ImgData>(null, changed.setT);
	const orien = useStateObj(character.orien, changed.setT);

	const mutationAdd = useMutationCharacterAdd(deleteNew);
	const mutationEdit = useMutationCharacterEdit(id.v, reset, () => reset());

	// eslint-disable-next-line
	useEffect(reset, [character])

	function reset(newCharacter?: GameDialogCharacter)
	{
		const data = newCharacter || character;
		id.setSilent(data.id);
		name.setSilent(data.name);
		orien.setSilent(data.orien);
		imgData.setSilent(null);
		changed.setF();
	}

	return (
		<div className={clsx(styles.root, changed.v && styles.changed)}>
			{mutationAdd.isPending && <Spinner block r="0.5rem" />}
			{displayError(mutationAdd, err => <div className={styles.error}>
				<div>{err}</div>
				<Button text="ОК" padding onClick={() => mutationAdd.reset()} />
			</div>)}
			{mutationEdit.isPending && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<Button text="ОК" padding onClick={() => mutationEdit.reset()} />
			</div>)}

			<PopupConfirm title={"Удалить персонажа: " + name.v} itemId={character.id} mutationFn={useMutationCharacterDelete} openState={deleting} />
			<div className={styles.id}>{character.id}</div>
			<InputImage imgData={imgData} curImg={character.img} />
			<div className={styles.inputs}>
				<div>Имя</div>
				<Input type="text" stateObj={name} />
				<span>Ориен</span>
				<Select values={{ 0: "Слева", 2: "Центр", 1: "Справа" }} item={it => it} stateObj={orien} />
			</div>
			<div className={styles.buttons}>
				{id.v > 0 ? <>
					{!changed.v && <Button text={<IconDelete />} onClick={deleting.setT} />}
					{changed.v && <Button
						text={<IconSave />}
						onClick={() =>
						{
							mutationEdit.mutate({
								name: name.v,
								img: imgData.v || undefined,
								orien: orien.v,
							});
						}}
					/>}
					{changed.v && <Button text={<IconCancel />} onClick={() => reset()} />}
				</> : <>
					<Button
						text={<IconSave />}
						onClick={() =>
						{
							mutationAdd.mutate({
								name: name.v,
								img: imgData.v || undefined,
								orien: orien.v,
							});
						}}
					/>
					<Button text={<IconDelete />} onClick={deleteNew} />
				</>}
			</div>
		</div>
	);
}
