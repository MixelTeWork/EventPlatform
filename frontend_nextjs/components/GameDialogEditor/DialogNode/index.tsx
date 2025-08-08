import styles from "./styles.module.css"
import { useEffect } from "react";
import { useDialogCharacters, type GameDialogNode } from "@/api/dialog";
import useStateObj from "@/utils/useStateObj";
import IconDelete from "@icons/delete";

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
				<select className={styles.selectName} value={characterId.v} onChange={e => characterId.set(parseInt(e.target.value, 10))}>
					{Object.values(characters.data || {}).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
				</select>
				<textarea
					className={styles.textarea}
					placeholder="Речь персонажа"
					value={text.v}
					onChange={e => text.set(e.target.value)}
				/>
			</div>
			<div className={styles.buttons}>
				<span className={styles.doubleBtn}>
					<button className={styles.btnUp} onClick={moveUp}></button>
					<button className={styles.btnPlus} onClick={addUp}></button>
				</span>
				<button onClick={deleteNode}><IconDelete /></button>
				<span className={styles.doubleBtn}>
					<button className={styles.btnPlus} onClick={addDown}></button>
					<button className={styles.btnDown} onClick={moveDown}></button>
				</span>
			</div>
		</div>
	);
}
