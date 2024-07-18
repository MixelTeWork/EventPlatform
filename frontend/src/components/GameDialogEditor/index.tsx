import type { GameDialogData } from "../../api/dialog";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
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
	return (
		<div className={styles.root}>
			<button onClick={close}>close</button>
			<h2>GameDialogEditor</h2>
			<ol>
				{data.nodes.map(v => <li key={v.title}>{v.title}</li>)}
			</ol>
		</div>
	);
}

interface GameDialogEditorProps
{
	data: GameDialogData;
	close: () => void;
}
