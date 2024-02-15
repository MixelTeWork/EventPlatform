import { useStoreItemsFull } from "../../api/store";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useTitle } from "../../utils/useTtile";
import AddStoreItem from "./AddStoreItem";
import StoreItem from "./StoreItem";
import styles from "./styles.module.css"

export default function ManageStorePage()
{
	useTitle("Товары");
	const items = useStoreItemsFull();

	return (
		<Layout centeredPage gap="0.5rem">
			{items.isLoading && <Spinner />}
			{displayError(items)}

			<h1>Управление товарами</h1>

			<AddStoreItem />

			<div className={styles.items}>
				{items.data?.map(item => <StoreItem key={item.id} item={item} />)}
			</div>
		</Layout>
	);
}
