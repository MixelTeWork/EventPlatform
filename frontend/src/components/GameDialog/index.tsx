import { useEffect, useState } from "react";
import styles from "./styles.module.css"
import classNames from "../../utils/classNames";
import { useDialog } from "../../api/dialog";
import Spinner from "../Spinner";
import displayError from "../../utils/displayError";
import useStateObj from "../../utils/useStateObj";
import useStateBool from "../../utils/useStateBool";
import { useMutationOpenQuest } from "../../api/quest";

export default function useGameDialog()
{
	const mutationOpen = useMutationOpenQuest();
	const update = useStateBool(false);
	const dialog = useStateObj({
		dialogId: -1,
		onClose: () => {},
		el: () => <GameDialog dialogId={dialog.v.dialogId} close={dialog.v.close} />,
		run: (dialogId: number, onClose?: () => void) =>
			dialog.set(v =>
			{
				v.dialogId = dialogId;
				v.onClose = onClose || (() => {});
				update.toggle();
				return v;
			}),
		close: () =>
			dialog.set(v =>
			{
				if (v.dialogId < 0) return v;

				mutationOpen.mutate(v.dialogId);
				v.dialogId = -1;
				v.onClose();
				update.toggle();
				return v;
			}),
	});

	return dialog.v;
}

function GameDialog({ dialogId, close }: GameDialogProps)
{
	const dialog = useDialog(dialogId);
	const [nodeI, setNodeI] = useState(0);
	const node = dialog.data?.data.nodes[nodeI];
	const open = dialogId >= 0;

	useEffect(() => setNodeI(0), [dialogId]);

	return (
		<div className={classNames(styles.root, open && styles.root_open)}>
			{dialog.isLoading && <Spinner />}
			{displayError(dialog)}
			{dialog.isSuccess && <>
				<img className={styles.img} src={node?.img} alt={node?.title} />
				<div className={styles.dialog_container}>
					<div className={styles.dialog}>
						<div className={styles.dialog__title}>{node?.title}</div>
						<div className={styles.dialog__body}>
							<p className={styles.dialog__text}>{node?.text}</p>
							<div className={styles.dialog__btns}>
								{nodeI > 0 ?
									<button className={styles.dialog__prev} onClick={() => setNodeI(v => v - 1)}>&lt;-</button>
									: <div></div>
								}
								{nodeI < dialog.data?.data.nodes.length - 1 ?
									<button className={styles.dialog__next} onClick={() => setNodeI(v => v + 1)}>Далее</button>
									:
									<button className={styles.dialog__next} onClick={close}>Конец</button>
								}
							</div>
						</div>
					</div>
				</div>
			</>}
		</div>
	);
}

interface GameDialogProps
{
	dialogId: number;
	close: () => void;
}
