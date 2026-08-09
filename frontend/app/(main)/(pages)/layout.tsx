import styles from "./layout.module.css"
import Footer from "@mCmps/Footer";
// import Header from "@mCmps/Header";
import HeaderSmall from "@mCmps/Header/HeaderSmall";
import Title from "@mCmps/Title";
import logo from "../(index)/logo.svg";
import Image from "next/image";

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
				<Image className={styles.logo} src={logo} alt="Underparty" priority />
				{/* <Title className={styles.title__text} text="Underparty" /> */}
			</div>
			<div className={styles.body}>
				{children}
			</div>
			<footer style={{ height: "3em" }}></footer>
			{/* <Footer /> */}
		</div>
	);
}
