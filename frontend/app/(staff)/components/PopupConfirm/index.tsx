import type { UseMutationResult } from "@tanstack/react-query";
import { useEffect } from "react";
import displayError from "@/utils/displayError";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import { Form } from "@/components/Form";
import type { StateBool } from "@/utils/useStateBool";
import Button from "@sCmps/Button";

export default function PopupConfirm<TD, TE, TV>({ title, mutationFn, mutatateParams, itemId, onSuccess, onError, open, close, openState }: {
	title: string | React.ReactNode,
	mutationFn: (itemId: number, onSuccess: (item: TD | void) => void, onError?: (err: TE) => void) => UseMutationResult<TD, TE, TV, unknown>,
	mutatateParams?: TV,
	itemId: number,
	onSuccess?: (item: TD | void) => void,
	onError?: (err: TE) => void,
	open?: boolean,
	close?: () => void,
	openState?: StateBool,
})
{
	const mutation = mutationFn(itemId, (item: TD | void) =>
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
				<Button text="Подтвердить" type="submit" danger />
			</Form>
		</Popup>
	);
}
