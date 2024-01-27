import Layout from "../../components/Layout"
import styles from "./styles.module.css"
import Scanner from "../../components/Scanner";
import { SellCheckRes, useMutationSellItem, useMutationSellItemCheck } from "../../api/store";
import { useState } from "react";
import Popup from "../../components/Popup";
import displayError from "../../utils/displayError";
import Spinner from "../../components/Spinner";

export default function ScannerStorePage()
{
	const [pauseScanner, setPauseScanner] = useState(false);
	const [popupOpened, setPopupOpened] = useState(false);
	const [sellData, setSellData] = useState<SellCheckRes | null>(null);
	const sellMutation = useMutationSellItem(onSell, onSell);

	function cancelSell()
	{
		setPauseScanner(false);
		setPopupOpened(false);
	}
	function onSell()
	{
		setPopupOpened(false);
	}
	function onSellDone()
	{
		sellMutation.reset();
		setPauseScanner(false);
	}

	return (
		<Layout className={styles.root}>
			{sellMutation.isLoading && <Spinner />}
			<div className={styles.title}>
				<h3>Просканируйте qr-код посетителя, чтобы продать ему товар.</h3>
			</div>

			<Scanner
				useMutation={useMutationSellItemCheck}
				pause={pauseScanner}
				onScan={scanned =>
				{
					const values = scanned.split(";");
					if (values.length != 2)
						return null
					const [user, item] = values;
					if (!user.startsWith("user_") || !item.startsWith("item_"))
						return null;
					const userId = parseInt(user.slice("user_".length), 10);
					const itemId = parseInt(item.slice("item_".length), 10);
					if (isNaN(userId) || isNaN(itemId))
						return null;
					return { userId, itemId };
				}}
				formatMsg={r => ({
					"ok": "",
					"no_item": `Товар не найден`,
					"no_player": `Покупатель не найден`,
					"no_money": `У ${r.player} не хватает средств`,
				}[r.res] ?? r.res)}
				onRes={r =>
				{
					if (r.res != "ok") return;
					setPauseScanner(true);
					setPopupOpened(true);
					setSellData(r);
				}}
			/>
			<Popup title="Продажа товара" open={popupOpened} closeOnOutclick={false} close={cancelSell}>
				<h3>{sellData?.player} хочет купить:</h3>
				<div className={styles.item}>
					<div className={styles.item__img}>
						<img src={sellData?.item.img} alt="Товар" />
					</div>
					<div className={styles.item__desc}>
						<span>{sellData?.item.name}</span>
						<span>{sellData?.item.price} G</span>
					</div>
				</div>
				<p>Выдайте товар и подтвердите покупку:</p>
				<div className={styles.btns}>
					<button className={styles.btn_deny} onClick={cancelSell}>
						Отклонить
					</button>
					<button className={styles.btn_ok} onClick={() =>
					{
						sellMutation.mutate({ userId: sellData!.playerId, itemId: sellData!.itemId });
					}}>
						Подтвердить
					</button>
				</div>
			</Popup>
			<Popup title="Продажа товара" open={sellMutation.isSuccess || sellMutation.isError} close={onSellDone}>
				{sellMutation.isSuccess && (sellMutation.data.res == "ok" ?
					<h2>Товар {sellMutation.data.item} успешно продан посетителю {sellMutation.data.player}</h2>
					:
					<h2>У {sellMutation.data.player} не хватает средств на покупку {sellMutation.data.item}</h2>
				)}
				{displayError(sellMutation)}
			</Popup>
		</Layout>
	);
}
