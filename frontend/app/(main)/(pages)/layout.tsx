import styles from "./layout.module.css"
import Footer from "@mCmps/Footer";
// import Header from "@mCmps/Header";
import HeaderSmall from "@mCmps/Header/HeaderSmall";
import Title from "@mCmps/Title";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>)
{
	return (
		<div className={styles.root}>
			<HeaderSmall />
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
