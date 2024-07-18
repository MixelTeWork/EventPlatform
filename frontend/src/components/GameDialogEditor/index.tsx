import { useDialogCharacters, type GameDialogData } from "../../api/dialog";
import displayError from "../../utils/displayError";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import Spinner from "../Spinner";
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

	return (
		<div className={styles.root}>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
			<button className={styles.close} onClick={close}></button>
			<div className={styles.body}>
				<h1>Редактирование диалога</h1>
				<ManageCharacters />
				<div className={styles.nodes}>
					{data.nodes.map((v, i) => <div key={i} className={styles.node}>
						<img src={characters.data?.[v.characterId].img} alt={characters.data?.[v.characterId].name} />
						<div>
							<h3>{characters.data?.[v.characterId].name}</h3>
							<div>{v.text}</div>
						</div>
					</div>)}
				</div>
			</div>
		</div>
	);
}

interface GameDialogEditorProps
{
	data: GameDialogData;
	close: () => void;
}
