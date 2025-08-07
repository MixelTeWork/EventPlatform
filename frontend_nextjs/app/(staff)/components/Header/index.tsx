"use client"
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useStateBool from "@/utils/useStateBool";
import clsx from "@/utils/clsx";
import Spinner from "@/components/Spinner";
import { useMutationLogout, useUser } from "@/api/user";
import hasPermission from "@/api/operations";
import IconHome from "@icons/home";
import IconCode from "@icons/code";
import IconWidgets from "@icons/widgets";
import IconExit from "@icons/exit";

export default function Header()
{
	const router = useRouter();
	const pathname = usePathname()
	const menuOpen = useStateBool(false);
	const logout = useMutationLogout(menuOpen.setF);
	const user = useUser();

	return (
		<div className={styles.root}>
			{logout.isPending && <Spinner />}
			<Link href={pathname == "/staff" ? "/" : "/staff"} className={styles.home}>
				<IconHome />
			</Link>
			<div className={styles.gap}></div>
			<div>{user.data?.balance || 0}М</div>
			<button className={styles.user} onClick={() => user.data?.auth ? menuOpen.set(v => !v) : router.push("/")}>
				<span>{user.data?.auth ? user.data?.name : "Войти"}</span>
				<Image className={styles.img} src={user.data?.photo || avatar} alt="avatar" />
			</button>
			<div className={clsx(styles.menu, menuOpen.v && styles.menuVisible)}>
				<Link href={"/"}><IconHome /></Link>
				{hasPermission(user, "page_debug") && <Link href="/debug"><IconCode /></Link>}
				{hasPermission(user, "page_staff") && <Link href="/worker"><IconWidgets /></Link>}
				<button className="clearBtn" onClick={() => logout.mutate()} disabled={logout.isPending || logout.isSuccess}>
					<IconExit />
				</button>
			</div>
		</div>
	);
}
