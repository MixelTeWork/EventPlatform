import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"
import { useTitle } from "../../utils/useTtile";
import { useMutationTicketLoginEnabled, useTicketLoginEnabled } from "../../api/other";
import useStateBool from "../../utils/useStateBool";
import IconSave from "../../icons/save";
import IconCancel from "../../icons/cancel";
import { useEffect } from "react";

export default function ConfigPage()
{
	useTitle("Настройки сайта");
	const ticketLoginEnabled_data = useTicketLoginEnabled();
	const ticketLoginEnabled = useStateBool(ticketLoginEnabled_data.data?.value || false)
	const mutateTicketLoginEnabled = useMutationTicketLoginEnabled();

	useEffect(() => ticketLoginEnabled.set(ticketLoginEnabled_data.data?.value || false), [ticketLoginEnabled_data.data?.value]);

	return (
		<Layout centered homeBtn gap="1rem" height100 className={styles.root} forStaff>
			{ticketLoginEnabled_data.isLoading && <Spinner />}
			{displayError(ticketLoginEnabled_data)}
			{mutateTicketLoginEnabled.isLoading && <Spinner />}
			{displayError(mutateTicketLoginEnabled)}
			<h2>Настройки сайта</h2>
			<div className={styles.inputs}>
				<span>Вход по билету</span>
				<label className={styles.checkbox}>
					<input type="checkbox" checked={ticketLoginEnabled.v} onChange={inp => ticketLoginEnabled.set(inp.target.checked)} />
					<span></span>
				</label>
				<div className={styles.buttons}>
					{ticketLoginEnabled_data.data && ticketLoginEnabled.v != ticketLoginEnabled_data.data.value && <>
						<button onClick={() => mutateTicketLoginEnabled.mutate(ticketLoginEnabled.v)}><IconSave /></button>
						<button onClick={() => ticketLoginEnabled.set(ticketLoginEnabled_data.data.value)}><IconCancel /></button>
					</>}
				</div>
			</div>
		</Layout>
	);
}
