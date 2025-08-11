import styles from "./styles.module.css"
import { useEffect } from "react";
import useStateBool from "@/utils/useStateBool";
import useStateObj, { useStateObjNull } from "@/utils/useStateObj";
import clsx from "@/utils/clsx";
import displayError from "@/utils/displayError";
import Spinner from "@/components/Spinner";
import { useMutationStoreItemDecrease, useMutationStoreItemDelete, useMutationStoreItemEdit, type StoreItemFull } from "@/api/store";
import type { ImgData } from "@/api/dataTypes";
import IconDelete from "@icons/delete";
import IconSave from "@icons/save";
import IconCancel from "@icons/cancel";
import PopupConfirm from "@sCmps/PopupConfirm";
import Button from "@sCmps/Button";
import Input from "@sCmps/Input";
import InputImage from "@sCmps/InputImage";

export default function StoreItem({ item }: {
	item: StoreItemFull
})
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const decreasing = useStateBool(false);
	const imgData = useStateObjNull<ImgData>(null, changed.setT);
	const name = useStateObj(item.name, changed.setT);
	const count = useStateObj(item.count, changed.setT);
	const price = useStateObj(item.price, changed.setT);

	const mutationEdit = useMutationStoreItemEdit(item.id, reset, () => reset());

	function reset(newitem?: StoreItemFull)
	{
		const data = newitem || item;
		imgData.setSilent(null);
		name.setSilent(data.name);
		count.setSilent(data.count);
		price.setSilent(data.price);
		changed.setF();
	}

	// eslint-disable-next-line
	useEffect(reset, [item])

	return (
		<div className={clsx(styles.root, changed.v && styles.changed)}>
			{mutationEdit.isPending && <Spinner block r="0.5rem" />}
			{imgData.v?.data == "" && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<Button text="ОК" onClick={() => mutationEdit.reset()} padding />
			</div>)}
			<PopupConfirm title={"Удалить товар: " + name.v} itemId={item.id} mutationFn={useMutationStoreItemDelete} openState={deleting} />
			<PopupConfirm title={"Уменьшить кол-во на 1: " + name.v} itemId={item.id} mutationFn={useMutationStoreItemDecrease} openState={decreasing} />
			<div className={styles.id}>{item.id}</div>
			<InputImage imgData={imgData} curImg={item.img} />
			<div className={styles.inputs}>
				<div>Название</div>
				<Input type="text" stateObj={name} />
				<div>Цена</div>
				<Input type="number" stateObj={price} />
				<div>Количество</div>
				<Input type="number" stateObj={count} />
			</div>
			<div className={styles.buttons}>
				{!changed.v && <Button text={<IconDelete />} onClick={deleting.setT} />}
				{!changed.v && <Button text="-1" className={styles.btnMinus} onClick={decreasing.setT} />}
				{changed.v && <Button
					text={<IconSave />}
					onClick={() => mutationEdit.mutate({
						name: name.v,
						count: count.v,
						price: price.v,
						img: imgData.v || undefined,
					})}
				/>}
				{changed.v && <Button text={<IconCancel />} onClick={() => reset()} />}
			</div>
		</div>
	);
}
