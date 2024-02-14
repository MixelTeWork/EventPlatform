import { useState } from "react";
import { useStoreItems } from "../../api/store";
import useUser, { useUpdateUser } from "../../api/user";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import btn from "./btn.png"
import styles from "./styles.module.css"
import QrCode from "../../components/QrCode";
import Popup from "../../components/Popup";
import { StoreItem } from "../../api/store";
import StyledWindow from "../../components/StyledWindow";

export default function StorePage()
{
	const user = useUser();
	const updateUser = useUpdateUser();
	const [popupIsOpen, setPopupIsOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
	const items = useStoreItems()

	return (
		<Layout centeredPage headerColor="#0a424c" gap="1em" className={styles.root} footer={<Footer curPage="store" />}>
			{items.isLoading && <Spinner />}
			<div className={styles.background}></div>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.body}>
				<StyledWindow title="Магазин" className={styles.list}>
					<div className={styles.items}>
						{displayError(items)}
						{items?.data?.map(item =>
							<div className={styles.item} key={item.id}>
								<div className={styles.item__img}>
									{item.img ? <img src={item.img} alt="Товар" /> : <div></div>}
								</div>
								<div className={styles.item__desc}>
									<span>{item.name}</span>
									<span>{item.price} G</span>
								</div>
							</div>
						)}
					</div>
				</StyledWindow>
				<button className={styles.btn}>
					<img src={btn} alt="Купить" />
				</button>
			</div>
			<Popup title="Покупка товара" open={popupIsOpen} close={() =>
			{
				setPopupIsOpen(false);
				if (!user.data?.auth || user.data.balance < (selectedItem?.price || 0)) return;
				updateUser();
			}}>
				{user?.data?.auth ?
					<>
						{user.data.balance < (selectedItem?.price || 0) ?
							<>
								<h2 style={{ marginBottom: 8 }}>К сожалению, этот товар вам не по карману</h2>
								<h2 className={styles.item__desc}>
									<span>{selectedItem?.name}</span>
									<span>{selectedItem?.price} G</span>
								</h2>
								<h2 className={styles.item__desc} style={{ marginBottom: 8 }}>
									<span>Вам не хватает:</span>
									<span>{(selectedItem?.price || 0) - user.data.balance} G</span>
								</h2>
								<h3>Выполняйте квесты и разбогатеете!</h3>
							</> : <>
								<QrCode code={`user_${user.data?.id};item_${selectedItem?.id}`} colorBg="#ffffff00" scale={13} />
								<h2 className={styles.item__desc}>
									<span>{selectedItem?.name}</span>
									<span>{selectedItem?.price} G</span>
								</h2>
								<h3>Покажите qr-код продавцу</h3>
								<h4>Если баланс не обновился через пару секунд - перезагрузите страницу</h4>
							</>
						}
					</> : <>
						<p>Для совершения покупок необходимо войти в систему.</p>
						<p>Кнопка входа находиться в правом верхнем углу.</p>
					</>
				}
			</Popup>
		</Layout>
	);
}
