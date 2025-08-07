import styles from "./styles.module.css"
import { useEffect, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import displayError from "@/utils/displayError";
import clsx from "@/utils/clsx";
import useStateObj from "@/utils/useStateObj";
import Spinner from "../Spinner";
import { useDialog, useDialogCharacters, type GameDialogCharacter, type GameDialogData } from "@/api/dialog";

export default function useGameDialog()
{
	const characters = useDialogCharacters();
	const update = useStateObj(0);
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
	}, () => update.set(v => v + 1));
	dialog.v._characters = characters;

	return dialog.v;
}

function GameDialogWithLoader({ dialogId, characters, close }: {
	dialogId: number;
	characters: UseQueryResult<{ [id: number]: GameDialogCharacter; }, unknown>;
	close: () => void;
})
{
	const dialog = useDialog(dialogId);

	return dialog.isSuccess ?
		<GameDialog data={dialog.data.data} close={close} characters={characters} />
		:
		<div className={styles.root}>
			<button className={styles.close} onClick={close}></button>
			{dialog.isLoading && <Spinner />}
			{displayError(dialog)}
		</div>
		;
}

function GameDialog({ data, characters, close }: {
	data: GameDialogData;
	characters: UseQueryResult<{ [id: number]: GameDialogCharacter; }, unknown>;
	close: () => void;
})
{
	const [nodeI, setNodeI] = useState(0);
	const node = data.nodes[nodeI];
	useEffect(() => setNodeI(0), [data]);

	if (!characters.isSuccess)
		return <div className={styles.root}>
			<button className={styles.close} onClick={close}></button>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
		</div>;

	if (!node)
		return <div className={styles.root}>
			<button className={styles.close} onClick={close}></button>
			<h2>Пусто</h2>
		</div>;

	const character = characters.data[node.characterId] || { id: -1, name: "УДАЛЁННЫЙ", img: "", orien: 1 };

	return (
		<div className={styles.root}>
			<button className={styles.close} onClick={close}></button>
			<div className={styles.dialog_container}>
				<div className={styles.dialog}>
					<img
						className={clsx(styles.img, character.orien == 1 && styles.img_right, character.orien == 2 && styles.img_center)}
						src={character.img}
						alt={character.name}
					/>
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
