import styles from "./styles.module.css"
import { createEmptyDialogNode, useDialogCharacters, type GameDialogData } from "@/api/dialog";
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import useStateObj from "@/utils/useStateObj";
import Spinner from "@/components/Spinner";
import Button from "@sCmps/Button";
import DialogNode from "./DialogNode";
import ManageCharacters from "./ManageCharacters";

export default function useGameDialogEditor(onClose?: (() => void))
{
	const update = useStateObj(0);
	const editor = useStateObj({
		_data: null as null | GameDialogData,
		_onClose: undefined as (() => void) | undefined,
		_onCloseMain: undefined as (() => void) | undefined,
		el: () => editor.v._data ? <GameDialogEditor data={editor.v._data} close={editor.v.close} /> : <></>,
		open: (data: GameDialogData, onClose?: () => void) =>
			editor.set(v =>
			{
				v._data = data;
				v._onClose = onClose;
				return v;
			}),
		close: () =>
			editor.set(v =>
			{
				if (!v._data) return v;
				v._data = null;
				v._onClose?.();
				v._onCloseMain?.();
				return v;
			}),
	}, () => update.set(v => v + 1));
	editor.v._onCloseMain = onClose;

	return editor.v;
}

function GameDialogEditor({ data, close }: {
	data: GameDialogData;
	close: () => void;
})
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
			<Button className={styles.close} onClick={close} />
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
				<Button text="Добавить реплику" onClick={() =>
				{
					data.nodes.push(createEmptyDialogNode());
					update.toggle();
				}} />
			</div>
		</div>
	);
}
