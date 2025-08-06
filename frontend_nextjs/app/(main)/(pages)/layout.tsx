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
			<h1 className={styles.title}>Underparty</h1>
			<div className={styles.body}>
				{children}
			</div>
			<Footer />
		</div>
	);
}
