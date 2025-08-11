"use client"
import styles from "./page.module.css"
import Spinner from "@/components/Spinner";
import Popup from "@/components/Popup";
import QrCode from "@/components/QrCode";
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import { useStateObjNull } from "@/utils/useStateObj";
import { useTitle } from "@/utils/useTtile";
import { useStoreItemsFull, type StoreItemFull } from "@/api/store";
import useSecuredPage from "@/utils/useSecuredPage";

export default function Page()
{
	useTitle("Qr Товары");
	useSecuredPage("page_staff_store");
	const items = useStoreItemsFull();
	const popupOpen = useStateBool(false);
	const selectedItem = useStateObjNull<StoreItemFull>(null, popupOpen.setT);

	return (
		<div className={styles.root}>
			<h1>Продажа</h1>
			{items.isLoading && <Spinner />}
			{displayError(items)}
			<div className={styles.items}>
				{items?.data?.map(item =>
					<button className={styles.item} key={item.id} onClick={() => selectedItem.set(item)}>
						<div className={styles.item__img}>
							{item.img ? <img src={item.img} alt="Товар" /> : <div></div>}
						</div>
						<div className={styles.item__desc}>
							<span>{item.name}</span>
							<span>{item.price} G</span>
						</div>
					</button>
				)}
			</div>
			<Popup title="Код товара" open={popupOpen.v} close={popupOpen.setF}>
				<div className={styles.qr}>
					<QrCode code={`item_${selectedItem.v?.id_big}`} colorBg="#ffffff00" scale={13} />
				</div>
				<div className={styles.item_small}>
					<div className={styles.item__img}>
						{selectedItem.v?.img ? <img src={selectedItem.v?.img} alt="Товар" /> : <div></div>}
					</div>
					<div>{selectedItem.v?.name}</div>
					<div>{selectedItem.v?.price} G</div>
				</div>
				<h3>QR-код для продажи товара</h3>
			</Popup>
		</div>
	);
}
