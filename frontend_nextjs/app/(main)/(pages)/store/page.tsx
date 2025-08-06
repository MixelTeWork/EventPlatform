"use client"
import styles from "./page.module.css"
import Link from "next/link";
import { useTitle } from "@/utils/useTtile";
import clsx from "@/utils/clsx";
import Spinner from "@/components/Spinner";
import StyledWindow from "@mCmps/StyledWindow";
import Textbox from "@mCmps/Textbox";
// import { useStoreItems } from "../../api/store";
// import displayError from "../../utils/displayError";

export default function ()
{
	useTitle("Магазин");
	// const items = useStoreItems()
	const items = { isLoading: false, data: [] as { img: string, count: string, name: string, price: number, id: number }[] };

	return (<>
		{items.isLoading && <Spinner />}
		<StyledWindow title="Магазин" className={styles.list}>
			<div className={styles.items}>
				{/* {displayError(items)} */}
				{items?.data?.map(item =>
					<Link href="/scanner" className={clsx(styles.item, item.count == "few" && styles.item_few, item.count == "no" && styles.item_ended)} key={item.id}>
						<div className={styles.item__img}>
							<div>
								{item.img ? <img src={item.img} alt="Товар" /> : <div></div>}
							</div>
						</div>
						<Textbox small btn className={styles.item__desc}>
							<div className={styles.item__desc__inner}>
								<span>{item.name} - </span>
								<span>{item.price}М</span>
							</div>
						</Textbox>
					</Link>
				)}
			</div>
		</StyledWindow>
	</>);
}
