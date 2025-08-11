"use client"
import styles from "./page.module.css"
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import useStateObj, { useStateObjNull } from "@/utils/useStateObj";
import { useTitle } from "@/utils/useTtile";
import useSecuredPage from "@/utils/useSecuredPage";
import Popup from "@/components/Popup";
import QrCode from "@/components/QrCode";
import Spinner from "@/components/Spinner";
import { useMutationCheckSend, useMutationSend, type Send } from "@/api/send";
import Input from "@sCmps/Input";
import Checkbox from "@sCmps/Checkbox";
import Button from "@sCmps/Button";

export default function SendPage()
{
	useTitle("Казначейство");
	useSecuredPage("send_any");
	const popupOpen = useStateBool(false);
	const send = useStateObjNull<Send>(null, popupOpen.setT);
	const mutation = useMutationSend(send.set);
	const mutationCheck = useMutationCheckSend();

	const reusable = useStateBool(false);
	const value = useStateObj(1);

	function submit(positive: boolean)
	{
		mutation.mutate({
			value: value.v,
			positive,
			reusable: reusable.v,
		});
		mutationCheck.reset();
	}

	return (
		<div className={styles.root}>
			<h2>Казначейство</h2>
			{mutation.isPending && <Spinner />}
			{mutationCheck.isPending && <Spinner />}
			{displayError(mutation)}
			<div className={styles.block}>
				<Input
					className={styles.value}
					type="number"
					value={value.v}
					onChangeV={v => value.set(Math.max(1, v))}
				/>
				<label className={styles.reusable}>
					<span>Многоразовый</span>
					<Checkbox stateObj={reusable} />
				</label>
				<div className={styles.action}>
					<Button text="Начислить" onClick={() => submit(true)} padding="0.5rem" />
					<Button text="Списать" onClick={() => submit(false)} padding="0.5rem" />
				</div>
			</div>
			<Popup title={send.v?.reusable ? "Многоразовый" : "Одноразовый"} openState={popupOpen}>
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
						<Button text="Проверить" padding="0.25rem" onClick={() => mutationCheck.mutate(send.v?.id || "")} disabled={mutationCheck.isPending} />
						<span className={mutationCheck.data?.successful ? styles.used : styles.notUsed}>
							{mutationCheck.data?.successful ? "Успешный перевод" : "Не использован"}
						</span>
					</div>
				}
			</Popup>
		</div>
	);
}
