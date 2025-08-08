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
import imagefileToData from "@/utils/imagefileToData";
import clsx from "@/utils/clsx";
import Spinner from "@/components/Spinner";
import PopupConfirm from "@sCmps/PopupConfirm";

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
		changed.setF();
	}

	return (
		<div className={clsx(styles.root, changed.v && styles.changed)}>
			{mutationAdd.isPending && <Spinner block r="0.5rem" />}
			{displayError(mutationAdd, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationAdd.reset()}>ОК</button>
			</div>)}
			{mutationEdit.isPending && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationEdit.reset()}>ОК</button>
			</div>)}

			<PopupConfirm title={"Удалить персонажа: " + name.v} itemId={character.id} mutationFn={useMutationCharacterDelete} open={deleting.v} close={deleting.setF} />
			<div className={styles.id}>{character.id}</div>
			<label className={styles.img}>
				{(character.img || imgData.v) && <img src={imgData.v?.data || character.img} alt="Картинка" />}
				<input
					type="file"
					style={{ display: "none" }}
					accept="image/png, image/jpeg, image/gif"
					onChange={async e =>
					{
						imgData.set({ data: "", name: "" });
						imgData.set(await imagefileToData(e.target?.files?.[0]!));
						e.target.value = "";
					}}
				/>
			</label>
			<div className={styles.inputs}>
				<div>Имя</div>
				<input type="text" value={name.v} onChange={inp => name.set(inp.target.value)} />
				<span>Ориен</span>
				<select className={styles.select} value={orien.v} onChange={e => orien.set(parseInt(e.target.value, 10))}>
					<option value={0}>Слева</option>
					<option value={2}>Центр</option>
					<option value={1}>Справа</option>
				</select>
			</div>
			<div className={styles.buttons}>
				{id.v > 0 ? <>
					{!changed.v && <button onClick={deleting.setT}><IconDelete /></button>}
					{changed.v && <button
						onClick={() =>
						{
							mutationEdit.mutate({
								name: name.v,
								img: imgData.v || undefined,
								orien: orien.v,
							});
						}}
					>
						<IconSave />
					</button>}
					{changed.v && <button onClick={() => reset()}><IconCancel /></button>}
				</> : <>
					<button
						onClick={() =>
						{
							mutationAdd.mutate({
								name: name.v,
								img: imgData.v || undefined,
								orien: orien.v,
							});
						}}
					>
						<IconSave />
					</button>
					<button onClick={deleteNew}><IconDelete /></button>
				</>}
			</div>
		</div>
	);
}
