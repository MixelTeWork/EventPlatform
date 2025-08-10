import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import { useStateObjNull } from "@/utils/useStateObj";
import type { UseMutationResult } from "@tanstack/react-query";
import Popup from "@/components/Popup";
import Button from "@sCmps/Button";

export default function ConfirmingButton({ text, bt, rt, disabled, className, mutation }: {
	text: string,
	bt: string,
	rt: string,
	disabled?: boolean,
	className?: string | false,
	mutation: (onSuccess?: () => void, onError?: (err: any) => void) => UseMutationResult<any, any, void, unknown>
})
{
	const popupOpen = useStateBool(false);
	const popupOpen2 = useStateBool(false);
	const err = useStateObjNull();

	const mutate = mutation(popupOpen2.setT, err.set)

	return <>
		{mutate.isPending && <Spinner />}
		<Button text={text} className={className || ""} onClick={popupOpen.setT} disabled={disabled} padding="0.4rem" calm />
		<Popup openState={popupOpen} closeOnOutclick>
			<h2>{text}?</h2>
			<br />
			<Button text={bt} padding="0.4rem" onClick={() =>
			{
				popupOpen.setF();
				mutate.mutate();
			}}/>
		</Popup>
		<Popup openState={popupOpen2} closeOnOutclick>
			<h2>{rt}</h2>
		</Popup>
		<Popup open={!!err.v} close={err.setNull} closeOnOutclick>
			{displayError(mutate)}
		</Popup>
	</>
}
