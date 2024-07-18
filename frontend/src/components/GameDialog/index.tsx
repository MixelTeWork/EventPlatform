import { useEffect, useState } from "react";
import styles from "./styles.module.css"
import { useDialog, useDialogCharacters, type GameDialogCharacter, type GameDialogData } from "../../api/dialog";
import Spinner from "../Spinner";
import displayError from "../../utils/displayError";
import useStateObj from "../../utils/useStateObj";
import useStateBool from "../../utils/useStateBool";
import type { UseQueryResult } from "react-query";

export default function useGameDialog()
{
	const characters = useDialogCharacters();
	const update = useStateBool(false);
	const dialog = useStateObj({
		_data: null as GameDialogData | null,
		_dialogId: -1,
		_characters: characters,
		_onClose: undefined as ((dialogId: number) => void) | undefined,
		el: () => dialog.v._data ?
			<GameDialog data={dialog.v._data} close={dialog.v.close} characters={dialog.v._characters} /> :
			dialog.v._dialogId >= 0 ?
				<GameDialogWithLoader dialogId={dialog.v._dialogId} close={dialog.v.close} characters={dialog.v._characters} /> :
				<></>,
		run: (dialogId: number, onClose?: (dialogId: number) => void) =>
			dialog.set(v =>
			{
				v._dialogId = dialogId;
				v._onClose = onClose;
				return v;
			}),
		runLocal: (data: GameDialogData, onClose?: () => void) =>
			dialog.set(v =>
			{
				v._data = data;
				v._onClose = onClose;
				return v;
			}),
		close: () =>
			dialog.set(v =>
			{
				if (v._dialogId < 0 && !v._data) return v;
				v._onClose?.(v._dialogId);
				v._onClose = undefined;
				v._dialogId = -1;
				v._data = null;
				return v;
			}),
	}, update.toggle);
	dialog.v._characters = characters;

	return dialog.v;
}

function GameDialogWithLoader({ dialogId, characters, close }: GameDialogWithLoaderProps)
{
	const dialog = useDialog(dialogId);

	return dialog.isSuccess ?
		<GameDialog data={dialog.data.data} close={close} characters={characters} />
		:
		<div className={styles.root}>
			{dialog.isLoading && <Spinner />}
			{displayError(dialog)}
		</div>
		;
}

interface GameDialogWithLoaderProps
{
	dialogId: number;
	characters: UseQueryResult<{ [id: number]: GameDialogCharacter; }, unknown>;
	close: () => void;
}

function GameDialog({ data, characters, close }: GameDialogProps)
{
	const [nodeI, setNodeI] = useState(0);
	const node = data.nodes[nodeI];
	useEffect(() => setNodeI(0), [data]);

	if (!characters.isSuccess)
		return <div className={styles.root}>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
		</div>;

	const character = characters.data[node.characterId];

	return (
		<div className={styles.root}>
			<img className={styles.img} src={character.img} alt={character.name} />
			<div className={styles.dialog_container}>
				<div className={styles.dialog}>
					<div className={styles.dialog__title}>{character.name}</div>
					<div className={styles.dialog__body}>
						<p className={styles.dialog__text}>{node.text}</p>
						<div className={styles.dialog__btns}>
							{nodeI > 0 ?
								<button className={styles.dialog__prev} onClick={() => setNodeI(v => v - 1)}>&lt;-</button>
								: <div></div>
							}
							{nodeI < data.nodes.length - 1 ?
								<button className={styles.dialog__next} onClick={() => setNodeI(v => v + 1)}>Далее</button>
								:
								<button className={styles.dialog__next} onClick={close}>Конец</button>
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

interface GameDialogProps
{
	data: GameDialogData;
	characters: UseQueryResult<{ [id: number]: GameDialogCharacter; }, unknown>;
	close: () => void;
}
