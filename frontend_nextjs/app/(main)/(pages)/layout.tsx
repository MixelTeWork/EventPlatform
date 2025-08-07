import styles from "./layout.module.css"
import Footer from "@mCmps/Footer";
import Header from "@mCmps/Header";
import Title from "@mCmps/Title";

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
				<Title className={styles.title__text} text="Underparty" />
			</div>
			<div className={styles.body}>
				{children}
			</div>
			<Footer />
		</div>
	);
}
