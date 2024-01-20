import useStoreItems from "../../api/storeItem";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"

export default function StorePage()
{
	const items = useStoreItems()

	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="store" />}>
			{items.isLoading && <Spinner />}
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.items}>
				{displayError(items)}
				{items?.data?.map(item =>
					<button className={styles.item} key={item.id}>
						<div className={styles.item__img}>
							<img src="https://ipsumimg.dakovdev.com/512x512" />
						</div>
						<div className={styles.item__desc}>
							<span>{item.name}</span>
							<span>{item.price}G</span>
						</div>
					</button>
				)}
			</div>
		</Layout>
	);
}
