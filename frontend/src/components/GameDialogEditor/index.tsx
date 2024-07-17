import type { GameDialogData } from "../../api/dialog";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import styles from "./styles.module.css"

export default function useGameDialogEditor()
{
	const update = useStateBool(false);
	const editor = useStateObj({
		data: null as null | GameDialogData,
		onClose: () => { },
		el: () => editor.v.data ? <GameDialogEditor data={editor.v.data} close={editor.v.close} /> : <></>,
		open: (data: GameDialogData, onClose?: () => void) =>
			editor.set(v =>
			{
				v.data = data;
				v.onClose = onClose || (() => { });
				update.toggle();
				return v;
			}),
		close: () =>
			editor.set(v =>
			{
				if (!v.data) return v;
				v.data = null;
				v.onClose();
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
