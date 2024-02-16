import { useRef } from "react";
import { Form, FormField } from "../../../components/Form"
import Popup from "../../../components/Popup"
import Spinner from "../../../components/Spinner";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import styles from "./styles.module.css"
import { useMutationAddQuest } from "../../../api/quest";
import useStateObj from "../../../utils/useStateObj";

export default function AddQuest()
{
	const nameRef = useRef<HTMLInputElement>(null);
	const rewardRef = useRef<HTMLInputElement>(null);
	const hiddenRef = useRef<HTMLInputElement>(null);
	const description = useStateObj("");
	const popupOpen = useStateBool(false);
	const mutationAdd = useMutationAddQuest(() =>
	{
		popupOpen.setF();
		if (nameRef.current)
			nameRef.current.value = "";
		if (rewardRef.current)
			rewardRef.current.value = "";
		if (hiddenRef.current)
			hiddenRef.current.checked = false;
		description.set("");
	});

	return <>
		<button className={styles.root} onClick={popupOpen.setT}>Добавить</button>
		<Popup title="Добавление квеста" open={popupOpen.v} close={popupOpen.setF}>
			{mutationAdd.isLoading && <Spinner />}
			{displayError(mutationAdd)}
			<Form onSubmit={() =>
			{
				const name = nameRef.current?.value;
				const reward = rewardRef.current?.valueAsNumber;
				const hidden = hiddenRef.current?.checked;
				if (name && reward !== undefined && hidden !== undefined)
					mutationAdd.mutate({
						name,
						reward,
						hidden,
						description: description.v,
					})
			}}>
				<FormField label="Название">
					<input ref={nameRef} required type="text" />
				</FormField>
				<FormField label="Награда">
					<input ref={rewardRef} required type="number" />
				</FormField>
				<FormField>
					<label>
						<input ref={hiddenRef} type="checkbox" />
						<span>Скрытый</span>
					</label>
				</FormField>
				<FormField label="Описание">
					<textarea
						className={styles.textarea}
						cols={40}
						rows={10}
						value={description.v}
						onChange={inp => description.set(inp.target.value)}
					/>
					<div className={styles.description_count}>
						<span>
							<span className={description.v.length > 256 ? styles.description_count_too_many : ""}>{description.v.length}</span>
							<span>/256</span>
						</span>
					</div>
				</FormField>
				<FormField>
					<button type="submit">Добавить</button>
				</FormField>
			</Form>
		</Popup>
	</>
}
