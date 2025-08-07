"use client"
import styles from "./page.module.css"
import Link from "next/link";
import { useHasPermission } from "@/api/operations";

export default function WorkerPage()
{
	return (
		<div className={styles.root}>
			{useHasPermission("manage_store") && <Link href="/manage_store">Управление магазином</Link>}
			{useHasPermission("manage_quest") && <Link href="/manage_quest">Управление квестами</Link>}
			{useHasPermission("page_staff_quest") && <Link href="/staff_quest">Для квестовиков</Link>}
			{useHasPermission("page_staff_store") && <Link href="/staff_store">Для продавцов</Link>}
			{useHasPermission("send_any") && <Link href="/send">Казначейство</Link>}
			{useHasPermission("promote_staff") && <Link href="/promote_staff">Повысить до волонтёра</Link>}
			{useHasPermission("promote_manager") && <Link href="/promote_manager">Повысить до управляющего</Link>}
			{useHasPermission("manage_games") && <Link href="/game_settings">Игра</Link>}
			{useHasPermission("page_stats") && <Link href="/stats">Статистика</Link>}
			{useHasPermission("site_config") && <Link href="/config">Настройки сайта</Link>}
		</div>
	);
}
