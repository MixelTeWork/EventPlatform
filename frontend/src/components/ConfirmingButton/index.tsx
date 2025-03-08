import type { UseMutationResult } from "react-query";
import displayError from "../../utils/displayError";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import Popup from "../Popup";
import Spinner from "../Spinner";
import styles from "./styles.module.css"

export default function ConfirmingButton({ h, bt, rt, className, mutation, children }: ConfirmingButtonProps)
{
	const popupOpen = useStateBool(false);
	const popupOpen2 = useStateBool(false);
	const err = useStateObj(null);

	const mutate = mutation(popupOpen2.setT, err.set)

	return <>
		{mutate.isLoading && <Spinner />}
		<button className={className} onClick={popupOpen.setT}>{children}</button>
		<Popup open={popupOpen.v} close={popupOpen.setF} closeOnOutclick>
			<h2>{h}</h2>
			<br />
			<button className={styles.btn} onClick={() =>
			{
				popupOpen.setF();
				mutate.mutate();
			}}>{bt}</button>
		</Popup>
		<Popup open={popupOpen2.v} close={popupOpen2.setF} closeOnOutclick>
			<h2>{rt}</h2>
		</Popup>
		<Popup open={!!err.v} close={() => err.set(null)} closeOnOutclick>
			{displayError(mutate)}
		</Popup>
	</>
}

interface ConfirmingButtonProps extends React.PropsWithChildren
{
	h: string,
	bt: string,
	rt: string,
	className?: string,
	mutation: (onSuccess?: () => void, onError?: (err: any) => void) => UseMutationResult<any, any, void, unknown>
}
