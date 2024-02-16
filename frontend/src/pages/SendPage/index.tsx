import { useMutationSend, type Send, useMutationCheckSend } from "../../api/send";
import Layout from "../../components/Layout";
import Popup from "../../components/Popup";
import QrCode from "../../components/QrCode";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"

export default function SendPage()
{
	useTitle("Казначейство");
	const popupOpen = useStateBool(false);
	const send = useStateObj<Send | null>(null, popupOpen.setT);
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
		<Layout centered homeBtn>
			<h2>Казначейство</h2>
			{mutation.isLoading && <Spinner />}
			{mutationCheck.isLoading && <Spinner />}
			{displayError(mutation)}
			<div className={styles.block}>
				<input
					className={styles.value}
					type="number"
					name="value"
					value={value.v}
					onChange={e => value.set(Math.max(1, e.target.valueAsNumber))}
				/>
				<label className={styles.reusable}>
					<span>Многоразовый</span>
					<div className={styles.checkbox}>
						<input type="checkbox" checked={reusable.v} onChange={e => reusable.set(e.target.checked)} />
						<span></span>
					</div>
				</label>
				<div className={styles.action}>
					<button onClick={() => submit(true)}>
						Начислить
					</button>
					<button onClick={() => submit(false)}>
						Списать
					</button>
				</div>
			</div>
			<Popup title={send.v?.reusable ? "Многоразовый" : "Одноразовый"} open={popupOpen.v} close={popupOpen.setF}>
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
