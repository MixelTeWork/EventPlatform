import { createEmptyDialogNode, useDialogCharacters, type GameDialogData } from "../../api/dialog";
import displayError from "../../utils/displayError";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import Spinner from "../Spinner";
import DialogNode from "./DialogNode";
import ManageCharacters from "./ManageCharacters";
import styles from "./styles.module.css"

export default function useGameDialogEditor()
{
	const update = useStateBool(false);
	const editor = useStateObj({
		_data: null as null | GameDialogData,
		_onClose: undefined as (() => void) | undefined,
		el: () => editor.v._data ? <GameDialogEditor data={editor.v._data} close={editor.v.close} /> : <></>,
		open: (data: GameDialogData, onClose?: () => void) =>
			editor.set(v =>
			{
				v._data = data;
				v._onClose = onClose;
				update.toggle();
				return v;
			}),
		close: () =>
			editor.set(v =>
			{
				if (!v._data) return v;
				v._data = null;
				v._onClose?.();
				update.toggle();
				return v;
			}),
	});

	return editor.v;
}

function GameDialogEditor({ data, close }: GameDialogEditorProps)
{
	const characters = useDialogCharacters();
	const update = useStateBool(false);

	function moveNode(fromI: number, toI: number)
	{
		if (toI < 0) return;
		data.nodes.splice(toI, 0, data.nodes.splice(fromI, 1)[0]);
		update.toggle();
	}
	function addNode(toI: number)
	{
		data.nodes.splice(toI, 0, createEmptyDialogNode());
		update.toggle();
	}
	function deleteNode(i: number)
	{
		data.nodes.splice(i, 1);
		update.toggle();
	}

	return (
		<div className={styles.root}>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
			<button className={styles.close} onClick={close}></button>
			<div className={styles.body}>
				<h1>Редактирование диалога</h1>
				<ManageCharacters />
				<div className={styles.nodes}>
					{data.nodes.map((v, i) => <DialogNode
						key={i}
						data={v}
						deleteNode={() => deleteNode(i)}
						moveUp={() => moveNode(i, i - 1)}
						moveDown={() => moveNode(i, i + 1)}
						addUp={() => addNode(i)}
						addDown={() => addNode(i + 1)}
					/>)}
				</div>
				<button className={styles.addBtn} onClick={() =>
				{
					data.nodes.push(createEmptyDialogNode());
					update.toggle();
				}}>Добавить реплику</button>
			</div>
		</div>
	);
}

interface GameDialogEditorProps
{
	data: GameDialogData;
	close: () => void;
}
