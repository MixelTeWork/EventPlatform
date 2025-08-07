import Popup from "@/components/Popup";
import styles from "./styles.module.css"
import { useEffect } from "react";
import displayError from "@/utils/displayError";
import Spinner from "@/components/Spinner";
import { Form } from "@/components/Form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { StateBool } from "@/utils/useStateBool";

export default function PopupConfirm<TD, TE, TV>({ title, mutationFn, mutatateParams, itemId, onSuccess, onError, open, close, openState }: {
	title: string | React.ReactNode,
	mutationFn: (itemId: number, onSuccess: (item: TD | void) => void, onError?: (err: TE) => void) => UseMutationResult<TD, TE, TV, any>,
	mutatateParams?: TV,
	itemId: number,
	onSuccess?: (item: TD) => void,
	onError?: (err: TE) => void,
	open?: boolean,
	close?: () => void,
	openState?: StateBool,
})
{
	const mutation = mutationFn(itemId, (item: any) =>
	{
		close?.();
		openState?.setF();
		onSuccess?.(item);
	}, onError);

	useEffect(() =>
	{
		if (!open)
			mutation.reset();
		// eslint-disable-next-line
	}, [open]);

	return (
		<Popup open={open} close={close} openState={openState} title="Вы уверены?" closeOnOutclick>
			{displayError(mutation)}
			{mutation.isPending && <Spinner />}
			<Form onSubmit={() =>
			{
				mutation.mutate(mutatateParams!);
			}}>
				{typeof title == "string" ? <h2>{title}</h2> : title}
				<button type="submit" className={styles.button}>Подтвердить</button>
			</Form>
		</Popup>
	);
}
