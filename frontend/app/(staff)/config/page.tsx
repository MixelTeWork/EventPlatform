"use client"
import styles from "./page.module.css"
import { useEffect } from "react";
import displayError from "@/utils/displayError";
import { useTitle } from "@/utils/useTtile";
import useStateBool from "@/utils/useStateBool";
import useSecuredPage from "@/utils/useSecuredPage";
import Spinner from "@/components/Spinner";
import IconSave from "@icons/save";
import IconCancel from "@icons/cancel";
import { useMutationTicketLoginEnabled, useTicketLoginEnabled } from "@/api/other";
import Checkbox from "@sCmps/Checkbox";
import Button from "@sCmps/Button";

export default function ConfigPage()
{
	useTitle("Настройки сайта");
	useSecuredPage("site_config");
	const ticketLoginEnabled_data = useTicketLoginEnabled();
	const ticketLoginEnabled = useStateBool(ticketLoginEnabled_data.data?.value || false)
	const mutateTicketLoginEnabled = useMutationTicketLoginEnabled();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => ticketLoginEnabled.set(ticketLoginEnabled_data.data?.value || false), [ticketLoginEnabled_data.data?.value]);

	return (
		<div className={styles.root}>
			{ticketLoginEnabled_data.isLoading && <Spinner />}
			{displayError(ticketLoginEnabled_data)}
			{mutateTicketLoginEnabled.isPending && <Spinner />}
			{displayError(mutateTicketLoginEnabled)}
			<h2>Настройки сайта</h2>
			<div className={styles.inputs}>
				<span>Вход по билету</span>
				<Checkbox className={styles.checkbox} stateObj={ticketLoginEnabled} />
				<div className={styles.buttons}>
					{ticketLoginEnabled_data.data && ticketLoginEnabled.v != ticketLoginEnabled_data.data.value && <>
						<Button text={<IconSave />} onClick={() => mutateTicketLoginEnabled.mutate(ticketLoginEnabled.v)} />
						<Button text={<IconCancel />} onClick={() => ticketLoginEnabled.set(ticketLoginEnabled_data.data.value)} />
					</>}
				</div>
			</div>
		</div>
	);
}
