import useStateBool from "@/utils/useStateBool";
import styles from "./styles.module.css"
import { useRef } from "react";
import { useStateObjNull } from "@/utils/useStateObj";
import type { ImgData } from "@/api/dataTypes";
import { useMutationTourneyCharacterAdd } from "@/api/tourney";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import { Form, FormField } from "@/components/Form";
import Button from "@sCmps/Button";
import InputImage from "@sCmps/InputImage";
import Input from "@sCmps/Input";

export default function AddCharacter()
{
	const popupOpen = useStateBool(false);
	const imgData = useStateObjNull<ImgData>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const colorRef = useRef<HTMLInputElement>(null);
	const mutationAdd = useMutationTourneyCharacterAdd(() =>
	{
		imgData.setNull();
		popupOpen.setF();
		if (nameRef.current)
			nameRef.current.value = "";
	});

	return <>
		<Button text="Добавить" onClick={popupOpen.setT} />
		<Popup title="Добавление персонажа" openState={popupOpen}>
			{mutationAdd.isPending && <Spinner />}
			{displayError(mutationAdd)}
			{imgData.v?.data == "" && <Spinner />}
			<Form
				className={styles.form}
				onSubmit={() =>
				{
					const name = nameRef.current?.value;
					const color = colorRef.current?.value;
					if (name && color && imgData.v && imgData.v.data != "")
						mutationAdd.mutate({
							name,
							color,
							img: imgData.v,
						});
				}}
			>
				<FormField label="Изображение">
					<InputImage className={styles.img} imgData={imgData} width="10rem" />
				</FormField>
				<FormField label="Имя">
					<Input ref={nameRef} required type="text" />
				</FormField>
				<FormField label="Цвет">
					<Input ref={colorRef} required type="color" />
				</FormField>
				<FormField>
					<Button text="Добавить" type="submit" />
				</FormField>
			</Form>
		</Popup>
	</>
}
