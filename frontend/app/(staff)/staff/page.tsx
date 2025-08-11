"use client"
import styles from "./page.module.css"
import Link from "next/link";
import { useUser } from "@/api/user";
import hasPermission from "@/api/operations";
import { useTitle } from "@/utils/useTtile";
import useSecuredPage from "@/utils/useSecuredPage";

export default function Page()
{
	useTitle("Управление");
	useSecuredPage("page_staff");
	const user = useUser();
	return (
		<div className={styles.root}>
			{hasPermission(user, "manage_store") && <Link href="/manage_store">Управление магазином</Link>}
			{hasPermission(user, "manage_quest") && <Link href="/manage_quest">Управление квестами</Link>}
			{hasPermission(user, "page_staff_quest") && <Link href="/staff_quest">Для квестовиков</Link>}
			{hasPermission(user, "page_staff_store") && <Link href="/staff_store">Для продавцов</Link>}
			{hasPermission(user, "send_any") && <Link href="/send">Казначейство</Link>}
			{hasPermission(user, "promote_staff") && <Link href="/promote_staff">Повысить до волонтёра</Link>}
			{hasPermission(user, "promote_manager") && <Link href="/promote_manager">Повысить до управляющего</Link>}
			{hasPermission(user, "manage_games") && <Link href="/game_settings">Игра</Link>}
			{hasPermission(user, "page_stats") && <Link href="/stats">Статистика</Link>}
			{hasPermission(user, "site_config") && <Link href="/config">Настройки сайта</Link>}
		</div>
	);
}
