import { useEffect } from "react";
import type { ImgData } from "../../../api/dataTypes";
import { useMutationDeleteTourneyCharacter, useMutationEditTourneyCharacter, type TourneyCharacter } from "../../../api/tourney";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import classNames from "../../../utils/classNames";
import Spinner from "../../../components/Spinner";
import displayError from "../../../utils/displayError";
import PopupConfirm from "../../../components/PopupConfirm";
import imagefileToData from "../../../utils/imagefileToData";
import IconDelete from "../../../icons/delete";
import IconSave from "../../../icons/save";
import IconCancel from "../../../icons/cancel";

export default function Character({ character }: CharacterProps)
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const imgData = useStateObj<ImgData | null>(null, changed.setT);
	const name = useStateObj(character.name, changed.setT);

	const mutationEdit = useMutationEditTourneyCharacter(character.id, reset, () => reset());

	function reset(newcharacter?: TourneyCharacter)
	{
		imgData.set(null);
		const data = newcharacter || character;
		name.set(data.name);
		changed.setF();
	}

	// eslint-disable-next-line
	useEffect(reset, [character])

	return (
		<div className={classNames(styles.root, changed.v && styles.changed)}>
			{mutationEdit.isLoading && <Spinner block r="0.5rem" />}
			{imgData.v?.data == "" && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationEdit.reset()}>ОК</button>
			</div>)}
			<PopupConfirm title={"Удалить персонажа: " + name.v} itemId={character.id} mutationFn={useMutationDeleteTourneyCharacter} open={deleting.v} close={deleting.setF} />
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
						imgData.set(await imagefileToData(e.target?.files?.[0]!, ""));
						e.target.value = "";
					}}
				/>
			</label>
			<div className={styles.inputs}>
				<div>Имя</div>
				<input type="text" value={name.v} onChange={inp => name.set(inp.target.value)} />
			</div>
			<div className={styles.buttons}>
				{!changed.v && <button onClick={deleting.setT}><IconDelete /></button>}
				{changed.v && <button

					onClick={() =>
					{
						mutationEdit.mutate({
							name: name.v,
							img: imgData.v || undefined,
						});
					}}
				>
					<IconSave />
				</button>}
				{changed.v && <button onClick={() => reset()}><IconCancel /></button>}
			</div>
		</div>
	);
}

interface CharacterProps
{
	character: TourneyCharacter
}
