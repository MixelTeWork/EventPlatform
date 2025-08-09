import styles from "./styles.module.css"
import { useEffect } from "react";
import { useDialogCharacters, type GameDialogNode } from "@/api/dialog";
import useStateObj from "@/utils/useStateObj";
import IconDelete from "@icons/delete";
import Select from "@sCmps/Select";
import Button from "@sCmps/Button";

export default function DialogNode({ data, deleteNode, moveUp, addUp, moveDown, addDown }: {
	data: GameDialogNode;
	deleteNode: () => void;
	moveUp: () => void;
	moveDown: () => void;
	addUp: () => void;
	addDown: () => void;
})
{
	const characters = useDialogCharacters();
	const characterId = useStateObj(data.characterId, v => data.characterId = v);
	const text = useStateObj(data.text, v => data.text = v);

	const character = characters.data?.[characterId.v];

	useEffect(() =>
	{
		characterId.set(data.characterId);
		text.set(data.text);
		// eslint-disable-next-line
	}, [data]);

	return (
		<div className={styles.root}>
			<img src={character?.img} alt={character?.name} />
			<div className={styles.body}>
				<Select className={styles.selectName} values={characters.data} item={it => it.name} stateObj={characterId} />
				<textarea
					className={styles.textarea}
					placeholder="Речь персонажа"
					value={text.v}
					onChange={e => text.set(e.target.value)}
				/>
			</div>
			<div className={styles.buttons}>
				<span className={styles.doubleBtn}>
					<Button className={styles.btnUp} onClick={moveUp} />
					<Button className={styles.btnPlus} onClick={addUp} />
				</span>
				<Button text={<IconDelete />} onClick={deleteNode} />
				<span className={styles.doubleBtn}>
					<Button className={styles.btnPlus} onClick={addDown} />
					<Button className={styles.btnDown} onClick={moveDown} />
				</span>
			</div>
		</div>
	);
}
