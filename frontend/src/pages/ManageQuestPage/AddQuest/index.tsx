import { useRef } from "react";
import { Form, FormField } from "../../../components/Form"
import Popup from "../../../components/Popup"
import Spinner from "../../../components/Spinner";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import styles from "./styles.module.css"
import { useMutationAddQuest } from "../../../api/quest";

export default function AddQuest()
{
	const nameRef = useRef<HTMLInputElement>(null);
	const rewardRef = useRef<HTMLInputElement>(null);
	const popupOpen = useStateBool(false);
	const mutationAdd = useMutationAddQuest(() =>
	{
		popupOpen.setF();
		if (nameRef.current)
			nameRef.current.value = "";
		if (rewardRef.current)
			rewardRef.current.value = "";
	});

	return <>
		<button className={styles.root} onClick={popupOpen.setT}>Добавить</button>
		<Popup title="Добавление квеста" open={popupOpen.v} close={popupOpen.setF} closeOnOutclick={false}>
			{mutationAdd.isLoading && <Spinner />}
			{displayError(mutationAdd)}
			<Form onSubmit={() =>
			{
				const name = nameRef.current?.value;
				const reward = rewardRef.current?.valueAsNumber;
				if (name && reward)
					mutationAdd.mutate({
						name,
						reward,
					})
			}}>
				<FormField label="Название">
					<input ref={nameRef} required type="text" />
				</FormField>
				<FormField label="Награда">
					<input ref={rewardRef} required type="number" />
				</FormField>
				<FormField>
					<button type="submit">Добавить</button>
				</FormField>
			</Form>
		</Popup>
	</>
}
