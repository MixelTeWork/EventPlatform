import { useStoreItems } from "../../api/store";
import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import styles from "./styles.module.css"
import StyledWindow from "../../components/StyledWindow";
import { Link } from "react-router-dom";
import classNames from "../../utils/classNames";
import { useTitle } from "../../utils/useTtile";
import Textbox from "../../components/Textbox";

export default function StorePage()
{
	useTitle("Магазин");
	const items = useStoreItems()

	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="store" />}>
			{items.isLoading && <Spinner />}
			<h1 className={classNames("title", styles.title)}>Underparty</h1>
			<StyledWindow title="Магазин" className={styles.list}>
				<div className={styles.items}>
					{displayError(items)}
					{items?.data?.map(item =>
						<Link to="/scanner" className={classNames(styles.item, item.count == "few" && styles.item_few, item.count == "no" && styles.item_ended)} key={item.id}>
							<div className={styles.item__img}>
								<div>
									{item.img ? <img src={item.img} alt="Товар" /> : <div></div>}
								</div>
							</div>
							<Textbox small dark btn>
								<div className={styles.item__desc}>
									<span>{item.name} - </span>
									<span>{item.price}М</span>
								</div>
							</Textbox>
						</Link>
					)}
				</div>
			</StyledWindow>
		</Layout>
	);
}
