import useStateObj from "@/utils/useStateObj";
import styles from "./styles.module.css"
import { useRef } from "react";
import useStateBool from "@/utils/useStateBool";
import { useMutationQuestAdd } from "@/api/quest";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import { Form, FormField } from "@/components/Form";
import Button from "@sCmps/Button";
import Input from "@sCmps/Input";
import Textarea from "@sCmps/Textarea";

export default function AddQuest()
{
	const nameRef = useRef<HTMLInputElement>(null);
	const rewardRef = useRef<HTMLInputElement>(null);
	const hiddenRef = useRef<HTMLInputElement>(null);
	const description = useStateObj("");
	const popupOpen = useStateBool(false);
	const mutationAdd = useMutationQuestAdd(() =>
	{
		popupOpen.setF();
		if (nameRef.current) nameRef.current.value = "";
		if (rewardRef.current) rewardRef.current.value = "";
		if (hiddenRef.current) hiddenRef.current.checked = false;
		description.set("");
	});

	return <>
		<Button text="Добавить" onClick={popupOpen.setT} />
		<Popup title="Добавление квеста" openState={popupOpen}>
			{mutationAdd.isPending && <Spinner />}
			{displayError(mutationAdd)}
			<Form
				className={styles.form}
				onSubmit={() =>
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
				}}
			>
				<FormField label="Название">
					<Input ref={nameRef} required type="text" />
				</FormField>
				<FormField label="Награда">
					<Input ref={rewardRef} required type="number" />
				</FormField>
				<FormField>
					<label>
						<Input type="checkbox" ref={hiddenRef} />
						<span>Скрытый</span>
					</label>
				</FormField>
				<FormField label="Описание">
					<Textarea cols={40} rows={10} stateObj={description} />
					<div className={styles.description_count}>
						<span>
							<span className={description.v.length > 512 ? styles.description_count_too_many : ""}>{description.v.length}</span>
							<span>/512</span>
						</span>
					</div>
				</FormField>
				<FormField>
					<Button text="Добавить" type="submit" />
				</FormField>
			</Form>
		</Popup>
	</>
}
