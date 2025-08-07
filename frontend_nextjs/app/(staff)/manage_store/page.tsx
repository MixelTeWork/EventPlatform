"use client"
import styles from "./page.module.css"
import { useTitle } from "@/utils/useTtile";
import displayError from "@/utils/displayError";
import Spinner from "@/components/Spinner";
import { useStoreItemsFull } from "@/api/store";
import AddStoreItem from "./AddStoreItem";
import StoreItem from "./StoreItem";
import useSecuredPage from "@/utils/useSecuredPage";

export default function Page()
{
	useTitle("Товары");
	useSecuredPage("manage_store");
	const items = useStoreItemsFull();

	return (<>
		{items.isLoading && <Spinner />}
		{displayError(items)}

		<h1>Управление товарами</h1>

		<AddStoreItem />

		<div className={styles.items}>
			{items.data?.map(item => <StoreItem key={item.id} item={item} />)}
		</div>
	</>);
}
