"use client"
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import deluxe_edition from "./avatar/deluxe_edition.png"
import goty_edition from "./avatar/goty_edition.png"
import reload from "./avatar/reload.png"
import standart_edition from "./avatar/standart_edition.png"
import standart_edition_plus from "./avatar/standart_edition_plus.png"
import ultimate_edition from "./avatar/ultimate_edition.png"
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
					{hasPermission(user, "page_dev") && <Link href="/dev"><IconCode /></Link>}
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
	95: standart_edition, // Standard edition
	96: standart_edition_plus, // Standard+ edition
	97: deluxe_edition, // Deluxe edition
	98: ultimate_edition, // Ultimate edition
	99: goty_edition, // GOTY edition
	100: reload, // Reload
	115: avatar, // Спец гость
	116: avatar, // Выступающий
	117: avatar, // Пресса
	118: avatar, // Маркет
	119: avatar, // Разработчик
} as { [id: number]: StaticImageData };
