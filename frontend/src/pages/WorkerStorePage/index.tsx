import Layout from "../../components/Layout"
import styles from "./styles.module.css"
import { useStoreItemsFull, type StoreItemFull } from "../../api/store";
import displayError from "../../utils/displayError";
import Spinner from "../../components/Spinner";
import Popup from "../../components/Popup";
import useStateBool from "../../utils/useStateBool";
import useStateObj from "../../utils/useStateObj";
import QrCode from "../../components/QrCode";
import { useTitle } from "../../utils/useTtile";

export default function WorkerStorePage()
{
	useTitle("Qr Товары");
	const items = useStoreItemsFull()
	const popupOpen = useStateBool(false);
	const selectedItem = useStateObj<StoreItemFull | null>(null, popupOpen.setT);

	return (
		<Layout centeredPage gap="1rem" height100 homeBtn>
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
		</Layout>
	);
}
