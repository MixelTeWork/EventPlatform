import styles from "./styles.module.css"
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import IconDelete from "@icons/delete";
import IconSave from "@icons/save";
import IconCancel from "@icons/cancel";
import useStateBool from "@/utils/useStateBool";
import useStateObj, { useStateObjNull } from "@/utils/useStateObj";
import { useMutationTourneyCharacterDelete, useMutationTourneyCharacterEdit, type TourneyCharacter } from "@/api/tourney";
import type { ImgData } from "@/api/dataTypes";
import clsx from "@/utils/clsx";
import PopupConfirm from "@sCmps/PopupConfirm";
import Button from "@sCmps/Button";
import InputImage from "@sCmps/InputImage";
import Input from "@sCmps/Input";

export default function Character({ character }: {
	character: TourneyCharacter
})
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const imgData = useStateObjNull<ImgData>(null, changed.setT);
	const name = useStateObj(character.name, changed.setT);
	const color = useStateObj(character.color, changed.setT);

	const mutationEdit = useMutationTourneyCharacterEdit(character.id, reset, () => reset());

	function reset(newcharacter?: TourneyCharacter)
	{
		const data = newcharacter || character;
		imgData.setSilent(null);
		name.setSilent(data.name);
		changed.setF();
	}

	// eslint-disable-next-line
	useEffect(reset, [character])

	return (
		<div className={clsx(styles.root, changed.v && styles.changed)}>
			{mutationEdit.isPending && <Spinner block r="0.5rem" />}
			{imgData.v?.data == "" && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<Button text="ОК" padding onClick={() => mutationEdit.reset()} />
			</div>)}
			<PopupConfirm title={"Удалить персонажа: " + name.v} itemId={character.id} mutationFn={useMutationTourneyCharacterDelete} openState={deleting} />
			<div className={styles.id}>{character.id}</div>
			<InputImage imgData={imgData} curImg={character.img} />
			<div className={styles.inputs}>
				<div>Имя</div>
				<Input type="text" stateObj={name} />
				<div>Цвет</div>
				<Input type="color" stateObj={color} />
			</div>
			<div className={styles.buttons}>
				{!changed.v && <Button text={<IconDelete />} onClick={deleting.setT} />}
				{changed.v && <Button
					text={<IconSave />}
					onClick={() => mutationEdit.mutate({
						name: name.v,
						color: color.v,
						img: imgData.v || undefined,
					})}
				/>}
				{changed.v && <Button text={<IconCancel />} onClick={() => reset()} />}
			</div>
		</div>
	);
}
