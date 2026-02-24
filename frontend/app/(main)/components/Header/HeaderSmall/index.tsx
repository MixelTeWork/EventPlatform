"use client"
import styles from "./styles.module.css"
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

export default function HeaderSmall({ homeBtn = false }: {
	homeBtn?: boolean
})
{
	const menuOpen = useStateBool(false);
	const router = useRouter();
	const logout = useMutationLogout(menuOpen.setF);
	const user = useUser();

	return (
		<div className={styles.root} suppressHydrationWarning>
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
			<div>{user.data?.balance}G</div>
			<button className={styles.name} onClick={() => user.data?.auth ? menuOpen.set(v => !v) : router.push("/")}>
				<div>{user.data?.name || "Войти ->"}</div>
			</button>
		</div>
	)
}
