"use client"
import logo from "./logo.png";
import Link from "next/link";
import Image from "next/image";
import useStateBool from "@/utils/useStateBool";
import AuthByTicket from "./AuthByTicket";
import useRedirectForAuthed from "@/utils/useRedirectForAuthed";
import Textbox from "@mCmps/Textbox";
import Title from "@mCmps/Title";
import styles from "./page.module.css"

export default function Page()
{
	useRedirectForAuthed("/map");
	const authOpen = useStateBool(false);

	return (
		<div className={styles.root}>
			<Link href="/auth" className={styles.auth} />
			<div></div>
			<Image className={styles.logo} src={logo} alt="Инди кон" />
			<button onClick={authOpen.setT}>
				<Textbox className={styles.btn} primary>
					<Title text="Вход" className={styles.btn__text} />
				</Textbox>
			</button>

			<AuthByTicket open={authOpen.v} />
		</div>
	);
}
