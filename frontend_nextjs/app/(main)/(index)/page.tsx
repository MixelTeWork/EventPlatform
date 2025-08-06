"use client"
import styles from "./page.module.css"
import logo from "./logo.png";
import btn from "./btn.png";
import Link from "next/link";
import Image from "next/image";
import useStateBool from "@/utils/useStateBool";
import AuthByTicket from "./AuthByTicket";

export default function ()
{
	const authOpen = useStateBool(false);

	return (
		<div className={styles.root}>
			<Link href="/auth" className={styles.auth} />
			<div></div>
			<Image className={styles.logo} src={logo} alt="Инди кон" />
			<button className={styles.btn} onClick={authOpen.setT}>
				<Image src={btn} alt="Вход" />
			</button>
			<AuthByTicket open={authOpen.v} />
		</div>
	);
}
