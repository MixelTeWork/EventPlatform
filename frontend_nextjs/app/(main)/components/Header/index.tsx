"use client"
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import avatar_monster from "./avatar/avatar_monster.png";
import avatar_human from "./avatar/avatar_human.png";
import avatar_creator from "./avatar/avatar_creator.png";
import avatar_destroyer from "./avatar/avatar_destroyer.png";
import avatar_traveler from "./avatar/avatar_traveler.png";
import avatar_coolman from "./avatar/avatar_coolman.png";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import useStateBool from "@/utils/useStateBool";
import Spinner from "@/components/Spinner";
import IconHome from "@icons/home";
import IconExit from "@icons/exit";
import IconCode from "@icons/code";
import IconWidgets from "@icons/widgets";
import { useMutationLogout, useUser } from "@/api/user";
import hasPermission from "@/api/operations";
import displayError from "@/utils/displayError";

export default function Header({ homeBtn = false }: {
	homeBtn?: boolean
})
{
	const menuOpen = useStateBool(false);
	const router = useRouter();
	const logout = useMutationLogout(menuOpen.setF);
	const user = useUser();

	return (
		<div className={styles.root}>
			{logout.isPending && <Spinner />}
			<div className={styles.menu}>
				<Link href={"/"} className={styles.home}>
					{homeBtn && <IconHome />}
				</Link>
				{menuOpen.v && <>
					<button onClick={() => logout.mutate()} disabled={logout.isPending || logout.isSuccess}>
						<IconExit />
					</button>
					{hasPermission(user, "page_debug") && <Link href="/debug"><IconCode /></Link>}
					{hasPermission(user, "page_staff") && <Link href="/staff"><IconWidgets /></Link>}
				</>}
			</div>
			<div className={styles.gap}>{displayError(logout)}</div>
			<div className={styles.text} suppressHydrationWarning>
				<div>{user.data?.name || "Войти ->"}</div>
				<div>{user.data?.balance} М</div>
			</div>
			<button className={styles.img} onClick={() => user.data?.auth ? menuOpen.set(v => !v) : router.push("/")}>
				<Image src={TTYPES[user.data?.ticketTId ?? 0] || avatar} alt="avatar" />
			</button>
		</div>
	)
}

const TTYPES = {
	70: avatar_monster, //"Монстр"
	71: avatar_human, //"Человек"
	72: avatar_coolman, //"Решительный человек"
	73: avatar_traveler, //"Путешественник по вселенным"
	74: avatar_destroyer, //"Разрушитель вселенных"
	75: avatar_creator, //"Создатель"
	90: avatar, //"Спец.Гость"
	91: avatar, //"Маркет"
	92: avatar, //"Участник"
	94: avatar, //"Пресса"
} as { [id: number]: StaticImageData };
