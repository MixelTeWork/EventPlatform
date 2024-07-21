import styles from "./styles.module.css"
import { UseMutationResult } from "react-query";
import displayError from "../../utils/displayError";
import { Form } from "../Form";
import Popup, { PopupProps } from "../Popup";
import Spinner from "../Spinner";
import { useEffect } from "react";

export default function PopupConfirm<T, TE, K>({ title, mutationFn, mutatateParams, itemId, onSuccess, onError, open, close }: PopupConfirmProps<T, TE, K>)
{
	const mutation = mutationFn(itemId, (item: any) =>
	{
		close?.();
		onSuccess?.(item);
	}, onError);

	useEffect(() =>
	{
		if (!open)
			mutation.reset();
		// eslint-disable-next-line
	}, [open]);

	return (
		<Popup open={open} close={close} title="Вы уверены?" closeOnOutclick>
			{displayError(mutation)}
			{mutation.isLoading && <Spinner />}
			<Form onSubmit={() =>
			{
				mutation.mutate(mutatateParams!);
			}}>
				<h2>{title}</h2>
				<button type="submit" className={styles.button}>Подтвердить</button>
			</Form>
		</Popup>
	);
}

interface PopupConfirmProps<T, TE, K> extends PopupProps
{
	mutationFn: (itemId: number, onSuccess: (item: T | void) => void, onError?: (err: TE) => void) => UseMutationResult<T, TE, K, any>,
	mutatateParams?: K,
	itemId: number,
	title: string,
	onSuccess?: (item: T) => void,
	onError?: (err: TE) => void,
}
