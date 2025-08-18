"use client"
import styles from "./page.module.css"
import Link from "next/link";
import clsx from "@/utils/clsx";
import displayError from "@/utils/displayError";
import { useTitle } from "@/utils/useTtile";
import Spinner from "@/components/Spinner";
import StyledWindow from "@mCmps/StyledWindow";
import { useStoreItems } from "@/api/store";

export default function Page()
{
	useTitle("Магазин");
	const items = useStoreItems();

	return (<>
		{items.isLoading && <Spinner />}
		<StyledWindow className={styles.list} title="store">
			<div className={styles.items}>
				{displayError(items)}
				{items?.data?.map(item =>
					<Link href="/scanner" className={clsx(styles.item, item.count == "few" && styles.item_few, item.count == "no" && styles.item_ended)} key={item.id}>
						<div className={styles.item__img}>
							<div>
								{item.img ? <img src={item.img} alt="Товар" /> : <div></div>}
							</div>
						</div>
						<div className={styles.item__desc}>
							<div className={styles.item__desc__inner}>
								<span>{item.name} - </span>
								<span>{item.price}М</span>
							</div>
						</div>
					</Link>
				)}
			</div>
		</StyledWindow>
	</>);
}
