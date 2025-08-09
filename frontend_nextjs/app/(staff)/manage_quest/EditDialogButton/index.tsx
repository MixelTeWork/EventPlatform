import useStateBool from "@/utils/useStateBool";
import styles from "./styles.module.css"
import { useEffect } from "react";
import { useDialog, useMutationDialogEdit, type GameDialogData } from "@/api/dialog";
import { useStateObjNull } from "@/utils/useStateObj";
import copyObj from "@/utils/copyObj";
import useGameDialog from "@/components/GameDialog";
import Spinner from "@/components/Spinner";
import useGameDialogEditor from "@sCmps/GameDialogEditor";
import IconEdit from "@icons/edit";
import PopupConfirm from "@sCmps/PopupConfirm";
import Button from "@sCmps/Button";
import getDialog from "../getDialog";

export default function EditDialogButton({ DIALOGID, text }: {
	DIALOGID: number,
	text: string,
})
{
	const saving = useStateBool(false);
	const dialogDataQuery = useDialog(DIALOGID, false);
	const dialogData = useStateObjNull<GameDialogData>();

	const dialog = useGameDialog();
	const editor = useGameDialogEditor(saving.setT);

	useEffect(() =>
	{
		if (!saving.v && dialogData.v && dialogDataQuery.isSuccess)
			dialogData.set(copyObj(dialogDataQuery.data.data));
		// eslint-disable-next-line
	}, [saving.v]);

	return <>
		{dialogDataQuery.isFetching && <Spinner />}
		{dialogData.v &&
			<PopupConfirm
				title={"Сохранить изменения"}
				itemId={DIALOGID}
				mutatateParams={{ data: dialogData.v }}
				mutationFn={useMutationDialogEdit}
				openState={saving}
			/>
		}
		<div className={styles.root}>
			<Button text={text} onClick={() => getDialog(dialogData, dialogDataQuery, dialog.runLocal)} />
			<Button text={<IconEdit />} onClick={() => getDialog(dialogData, dialogDataQuery, editor.open)} />
		</div>
		{dialog.el()}
		{editor.el()}
	</>;
}
