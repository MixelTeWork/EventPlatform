import Footer from "@mCmps/Footer";
import styles from "./layout.module.css"
import Header from "@mCmps/Header";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<div className={styles.root}>
			<Header />
			<div className={styles.title}>
				<h1>Underparty</h1>
			</div>
			<div className={styles.body}>
				{children}
			</div>
			<Footer />
		</div>
	);
}
