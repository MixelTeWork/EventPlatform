import styles from "./styles.module.css"
import { useRef } from "react";
import useStateObj from "@/utils/useStateObj";
import useStateBool from "@/utils/useStateBool";
import displayError from "@/utils/displayError";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import { Form, FormField } from "@/components/Form";
import type { ImgData } from "@/api/dataTypes";
import { useMutationStoreItemAdd } from "@/api/store";
import Button from "@sCmps/Button";
import Input from "@sCmps/Input";
import InputImage from "@sCmps/InputImage";

export default function AddStoreItem()
{
	const imgData = useStateObj<ImgData | null>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const priceRef = useRef<HTMLInputElement>(null);
	const countRef = useRef<HTMLInputElement>(null);
	const popupOpen = useStateBool(false);
	const popupSuccessOpen = useStateBool(false);
	const mutationAdd = useMutationStoreItemAdd(() =>
	{
		imgData.set(null);
		popupOpen.setF();
		popupSuccessOpen.setT();
		if (nameRef.current)
			nameRef.current.value = "";
		if (priceRef.current)
			priceRef.current.value = "";
		if (countRef.current)
			countRef.current.value = "";
	});

	return <>
		<Button text="Добавить" onClick={popupOpen.setT} />
		<Popup title="Добавление товара" openState={popupOpen}>
			{mutationAdd.isPending && <Spinner />}
			{displayError(mutationAdd)}
			{imgData.v?.data == "" && <Spinner />}
			<Form
				className={styles.form}
				onSubmit={() =>
				{
					const name = nameRef.current?.value;
					const count = countRef.current?.valueAsNumber;
					const price = priceRef.current?.valueAsNumber;
					if (count && name && price)
						mutationAdd.mutate({
							count,
							name,
							price,
							img: imgData.v || undefined,
						})
				}}
			>
				<FormField label="Изображение">
					<InputImage className={styles.img} imgData={imgData} width="10rem" />
				</FormField>
				<FormField label="Название">
					<Input ref={nameRef} required type="text" />
				</FormField>
				<FormField label="Цена">
					<Input ref={priceRef} required type="number" />
				</FormField>
				<FormField label="Количество">
					<Input ref={countRef} required type="number" />
				</FormField>
				<FormField>
					<Button text="Добавить" type="submit" />
				</FormField>
			</Form>
		</Popup>
		<Popup title="Добавление товара" openState={popupSuccessOpen}>
			<h2>Товар {mutationAdd.data?.name} добавлен</h2>
		</Popup>
	</>
}
