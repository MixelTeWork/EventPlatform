import { useRef } from "react";
import { useMutationAddItem } from "../../../api/store";
import { Form, FormField } from "../../../components/Form"
import Popup from "../../../components/Popup"
import Spinner from "../../../components/Spinner";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import styles from "./styles.module.css"
import imagefileToData from "../../../utils/imagefileToData";
import useStateObj from "../../../utils/useStateObj";
import type { ImgData } from "../../../api/dataTypes";

export default function AddStoreItem()
{
	const imgData = useStateObj<ImgData | null>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const priceRef = useRef<HTMLInputElement>(null);
	const countRef = useRef<HTMLInputElement>(null);
	const popupOpen = useStateBool(false);
	const mutationAdd = useMutationAddItem(() =>
	{
		imgData.set(null);
		popupOpen.setF();
		if (nameRef.current)
			nameRef.current.value = "";
		if (priceRef.current)
			priceRef.current.value = "";
		if (countRef.current)
			countRef.current.value = "";
	});

	return <>
		<button className={styles.root} onClick={popupOpen.setT}>Добавить</button>
		<Popup title="Добавление товара" open={popupOpen.v} close={popupOpen.setF} closeOnOutclick={false}>
			{mutationAdd.isLoading && <Spinner />}
			{displayError(mutationAdd)}
			{imgData.v?.data == "" && <Spinner />}
			<Form onSubmit={() =>
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
			}}>
				<FormField label="Изображение">
					<div className={styles.img}>
						{imgData.v && <img src={imgData.v.data} alt="Изображение" />}
					</div>
					<input type="file" style={{ display: "none" }} onChange={async e =>
					{
						imgData.set({ data: "", name: "" });
						imgData.set(await imagefileToData(e.target?.files?.[0]!, ""));
					}} />
				</FormField>
				<FormField label="Название">
					<input ref={nameRef} required type="text" />
				</FormField>
				<FormField label="Цена">
					<input ref={priceRef} required type="number" />
				</FormField>
				<FormField label="Количество">
					<input ref={countRef} required type="number" />
				</FormField>
				<FormField>
					<button type="submit">Добавить</button>
				</FormField>
			</Form>
		</Popup>
	</>
}
