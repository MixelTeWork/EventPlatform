"use client"
import logo from "./logo.png";
import Link from "next/link";
import Image from "next/image";
import useStateBool from "@/utils/useStateBool";
import AuthByTicket from "./AuthByTicket";
import useRedirectForAuthed from "@/utils/useRedirectForAuthed";
import Title from "@mCmps/Title";
import styles from "./page.module.css"
import Textbox2 from "@mCmps/Textbox2";

export default function Page()
{
	useRedirectForAuthed("/map");
	const authOpen = useStateBool(false);

	return (
		<div className={styles.root}>
			<Link href="/auth" className={styles.auth} />
			<Title text="Underparty"  className={styles.title} />
			<Image className={styles.logo} src={logo} alt="Underparty" priority />
			<button onClick={authOpen.setT}>
				<Textbox2 primary>
					<Title text="Вход" className={styles.btn} />
				</Textbox2>
			</button>

			<AuthByTicket open={authOpen.v} />
		</div>
	);
}
