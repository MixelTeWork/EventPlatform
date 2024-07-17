import type { GameDialogData } from "../../api/dialog";
import styles from "./styles.module.css"

export default function GameDialogEditor({ data }: GameDialogEditorProps)
{
	return (
		<div className={styles.root}>
			<h2>GameDialogEditor</h2>
			<ol>
				{data.nodes.map(v => <li>{v.title}</li>)}
			</ol>
		</div>
	);
}

interface GameDialogEditorProps
{
	data: GameDialogData;
}
