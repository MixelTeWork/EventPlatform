import { useMutationSend, type Send, useMutationCheckSend } from "../../api/send";
import { Form, FormField } from "../../components/Form";
import Layout from "../../components/Layout";
import Popup from "../../components/Popup";
import QrCode from "../../components/QrCode";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import styles from "./styles.module.css"

export default function SendPage()
{
	const popupOpen = useStateBool(false);
	const send = useStateObj<Send | null>(null, popupOpen.setT);
	const mutation = useMutationSend(send.set);
	const mutationCheck = useMutationCheckSend();

	return (
		<Layout centered homeBtn>
			<h2>Казначейство</h2>
			{mutation.isLoading && <Spinner />}
			{mutationCheck.isLoading && <Spinner />}
			{displayError(mutation)}
			<Form
				className={styles.block}
				onSubmit={data =>
				{
					const value = parseInt(data.get("value")?.toString() || "")
					const action = data.get("action")?.toString()
					const reusable = data.get("reusable")?.toString()
					mutation.mutate({
						value,
						positive: action == "positive",
						reusable: reusable !== undefined,
					});
					mutationCheck.reset();
				}}
			>
				<FormField>
					<input
						type="number"
						name="value"
						defaultValue="1"
						className={styles.value}
						onChange={e => e.target.valueAsNumber = Math.max(1, e.target.valueAsNumber)}
					/>
				</FormField>
				<FormField>
					<label className={styles.reusable}>
						<span>Многоразовый</span>
						<div className={styles.checkbox}>
							<input type="checkbox" name="reusable" />
							<span></span>
						</div>
					</label>
				</FormField>
				<FormField>
					<div className={styles.action}>
						<label>
							<input type="radio" name="action" value="positive" defaultChecked />
							<span>Начислить</span>
						</label>
						<label>
							<input type="radio" name="action" value="negative" />
							<span>Списать</span>
						</label>
					</div>
				</FormField>
				<FormField>
					<button type="submit" className={styles.btn}>Подтвердить</button>
				</FormField>
			</Form>
			<Popup title={send.v?.reusable ? "Многоразовый": "Одноразовый"} open={popupOpen.v} close={popupOpen.setF}>
				<div className={styles.qr}>
					<QrCode code={"send_" + send.v?.id} colorBg="#ffffff00" scale={13} />
				</div>
				<div className={styles.send}>
					<h2>{send.v?.positive ? "Зачисление" : "Списание"}</h2>
					<h1>{send.v?.positive ? "+" : "-"}{send.v?.value} G</h1>
				</div>
				{displayError(mutationCheck)}
				{!send.v?.reusable &&
					<div className={styles.check}>
						<button
							onClick={() => mutationCheck.mutate(send.v?.id || "")}
						>
							Проверить
						</button>
						<span
							className={mutationCheck.data?.successful ? styles.used : styles.notUsed}
						>
							{mutationCheck.data?.successful ? "Успешный перевод" : "Не использован"}
						</span>
					</div>
				}
			</Popup>
		</Layout>
	);
}
