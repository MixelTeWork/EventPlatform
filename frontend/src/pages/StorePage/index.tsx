import Footer from "../../components/Footer";
import Layout from "../../components/Layout";
import styles from "./styles.module.css"

export default function StorePage()
{
	return (
		<Layout centeredPage gap="1em" className={styles.root} footer={<Footer curPage="store" />}>
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.items}>
				{new Array(10).fill(0).map((_, i) =>
					<button className={styles.item} key={i}>
						<div className={styles.item__img}>
							<img src="https://ipsumimg.dakovdev.com/512x512" />
						</div>
						<div className={styles.item__desc}>
							<span>Товар {i + 1}</span>
							<span>{(i + 1) * 2343 % 150 + 50}G</span>
						</div>
					</button>
				)}
			</div>
		</Layout>
	);
}
