import { useStoreItems } from "../../api/store";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import btn from "./btn.png"
import styles from "./styles.module.css"
import StyledWindow from "../../components/StyledWindow";
import { Link } from "react-router-dom";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";

export default function StorePage()
{
	useTitle("Магазин");
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
							<div className={classNames(styles.item, item.count == "few" && styles.item_few, item.count == "no" && styles.item_ended)} key={item.id}>
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
				<Link to="/scanner" className={styles.btn}>
					<img src={btn} alt="Купить" />
				</Link>
			</div>
		</Layout>
	);
}
