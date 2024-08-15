import { useEffect } from "react";
import { useDialog, useMutationEditDialog, type GameDialogData } from "../../../api/dialog";
import useGameDialogEditor from "../../../components/GameDialogEditor";
import PopupConfirm from "../../../components/PopupConfirm";
import Spinner from "../../../components/Spinner";
import copyObj from "../../../utils/copyObj";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import useGameDialog from "../../../components/GameDialog";
import IconEdit from "../../../icons/edit";

const DIALOGID = 2;

export default function EditGameDialog()
{
	const saving = useStateBool(false);
	const dialogDataQuery = useDialog(DIALOGID, false);
	const dialogData = useStateObj<GameDialogData | null>(null);

	const dialog = useGameDialog();
	const editor = useGameDialogEditor(saving.setT);

	useEffect(() =>
	{
		if (!saving.v && dialogData.v && dialogDataQuery.isSuccess)
			dialogData.set(copyObj(dialogDataQuery.data.data));
		// eslint-disable-next-line
	}, [saving.v]);

	async function getDialog(fn: (dialog: GameDialogData) => void)
	{
		if (dialogData.v) fn(dialogData.v);
		else if (dialogDataQuery.isSuccess && !dialogDataQuery.isStale)
		{
			const data = copyObj(dialogDataQuery.data.data);
			dialogData.set(data);
			fn(data);
		}
		else if (dialogDataQuery.isIdle || dialogDataQuery.isStale || dialogDataQuery.isError)
		{
			const d = await dialogDataQuery.refetch();
			if (d.isSuccess)
			{
				const data = copyObj(d.data.data);
				dialogData.set(data);
				fn(data);
			}
		}
	}

	return <>
		{dialogDataQuery.isFetching && <Spinner />}
		{dialogData.v &&
			<PopupConfirm
				title={"Сохранить изменения"}
				itemId={DIALOGID}
				mutatateParams={{ data: dialogData.v }}
				mutationFn={useMutationEditDialog}
				open={saving.v}
				close={saving.setF}
			/>
		}
		<div className={styles.root}>
			<button onClick={() => getDialog(dialog.runLocal)}>Диалог перед игрой</button>
			<button onClick={() => getDialog(editor.open)}><IconEdit /></button>
		</div>
		{dialog.el()}
		{editor.el()}
	</>;
}
