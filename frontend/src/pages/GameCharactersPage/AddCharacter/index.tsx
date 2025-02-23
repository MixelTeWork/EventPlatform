import { useRef } from "react";
import type { ImgData } from "../../../api/dataTypes";
import Popup from "../../../components/Popup"
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import { useMutationAddTourneyCharacter } from "../../../api/tourney";
import Spinner from "../../../components/Spinner";
import displayError from "../../../utils/displayError";
import { Form, FormField } from "../../../components/Form";
import imagefileToData from "../../../utils/imagefileToData";

export default function AddCharacter()
{
	const popupOpen = useStateBool(false);
	const imgData = useStateObj<ImgData | null>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const mutationAdd = useMutationAddTourneyCharacter(() =>
	{
		imgData.set(null);
		popupOpen.setF();
		if (nameRef.current)
			nameRef.current.value = "";
	});

	return <>
		<button className={styles.root} onClick={popupOpen.setT}>Добавить</button>
		<Popup title="Добавление персонажа" open={popupOpen.v} close={popupOpen.setF}>
			{mutationAdd.isLoading && <Spinner />}
			{displayError(mutationAdd)}
			{imgData.v?.data == "" && <Spinner />}
			<Form
				className={styles.form}
				onSubmit={() =>
				{
					const name = nameRef.current?.value;
					if (name && imgData.v && imgData.v.data != "")
						mutationAdd.mutate({
							name,
							img: imgData.v,
						});
				}}
			>
				<FormField label="Изображение">
					<div className={styles.img}>
						{imgData.v && <img src={imgData.v.data} alt="Изображение" />}
					</div>
					<input
						type="file"
						required
						accept="image/png, image/jpeg, image/gif"
						style={{ position: "absolute", opacity: 0 }}
						onChange={async e =>
						{
							imgData.set({ data: "", name: "" });
							imgData.set(await imagefileToData(e.target?.files?.[0]!, ""));
						}}
					/>
				</FormField>
				<FormField label="Имя">
					<input ref={nameRef} required type="text" />
				</FormField>
				<FormField>
					<button type="submit">Добавить</button>
				</FormField>
			</Form>
		</Popup>
	</>
}
