import { useEffect } from "react";
import { useMutationEditItem, type StoreItem, useMutationDeleteItem, useMutationDecreaseItem } from "../../../api/store";
import PopupConfirm from "../../../components/PopupConfirm";
import Spinner from "../../../components/Spinner";
import classNames from "../../../utils/classNames";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import type { ImgData } from "../../../api/dataTypes";
import imagefileToData from "../../../utils/imagefileToData";
import IconDelete from "../../../icons/delete";
import IconCancel from "../../../icons/cancel";
import IconSave from "../../../icons/save";

export default function StoreItem({ item }: StoreItemProps)
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const decreasing = useStateBool(false);
	const imgData = useStateObj<ImgData | null>(null, changed.setT);
	const name = useStateObj(item.name, changed.setT);
	const count = useStateObj(item.count, changed.setT);
	const price = useStateObj(item.price, changed.setT);

	const mutationEdit = useMutationEditItem(item.id, reset, () => reset());

	function reset(newitem?: StoreItem)
	{
		imgData.set(null);
		name.set(newitem?.name || item.name);
		count.set(newitem?.count || item.count);
		price.set(newitem?.price || item.price);
		changed.setF();
	}

	useEffect(reset, [item])

	return (
		<div className={classNames(styles.root, changed.v && styles.changed)}>
			{mutationEdit.isLoading && <Spinner block r="0.5rem" />}
			{imgData.v?.data == "" && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationEdit.reset()}>ОК</button>
			</div>)}
			<PopupConfirm title={"Удалить товар: " + name.v} itemId={item.id} mutationFn={useMutationDeleteItem} open={deleting.v} close={deleting.setF} />
			<PopupConfirm title={"Уменьшить кол-во на 1: " + name.v} itemId={item.id} mutationFn={useMutationDecreaseItem} open={decreasing.v} close={decreasing.setF} />
			<div className={styles.id}>{item.id}</div>
			<label className={styles.img}>
				{(item.img || imgData.v) && <img src={imgData.v?.data || item.img} alt="Картинка" />}
				<input type="file" style={{ display: "none" }} onChange={async e =>
				{
					imgData.set({ data: "", name: "" });
					imgData.set(await imagefileToData(e.target?.files?.[0]!, ""));
					e.target.value = "";
				}} />
			</label>
			<div className={styles.inputs}>
				<div>Название</div>
				<input type="text" value={name.v} onChange={inp => name.set(inp.target.value)} />
				<div>Цена</div>
				<input type="number" value={price.v} onChange={inp => price.set(inp.target.valueAsNumber)} />
				<div>Количество</div>
				<input type="number" value={count.v} onChange={inp => count.set(inp.target.valueAsNumber)} />
			</div>
			<div className={styles.buttons}>
				{!changed.v && <button onClick={deleting.setT}><IconDelete /></button>}
				{!changed.v && <button className={styles.btnMinus} onClick={decreasing.setT}>-1</button>}
				{changed.v && <button

					onClick={() =>
					{
						mutationEdit.mutate({
							name: name.v,
							count: count.v,
							price: price.v,
							img: imgData.v || undefined,
						});
					}}
				>
					<IconSave />
				</button>}
				{changed.v && <button onClick={() => reset()}><IconCancel /></button>}
			</div>
		</div>
	);
}

interface StoreItemProps
{
	item: StoreItem
}