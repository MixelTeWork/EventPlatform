"use client"
import styles from "./PromotePage.module.css"
import QrCode from "@/components/QrCode";
import { useTitle } from "@/utils/useTtile";
import { useUser } from "@/api/user";

export default function PromotePage({ role }: {
	role: "staff" | "manager",
})
{
	const user = useUser();
	const roleText = {
		"staff": "волонтёра",
		"manager": "управляющего",
	}[role];
	const roleText2 = {
		"staff": "волонтёром",
		"manager": "управляющим",
	}[role];
	useTitle(`Повышение до ${roleText}`);
	if (!roleText) throw new Error("No such role");

	return (
		<div className={styles.root}>
			<h1>Повышение до {roleText}</h1>
			<div className={styles.qr}>
				<QrCode code={`promote_${role}_${user.data?.id}`} colorBg="#ffffff00" scale={13} />
			</div>
			<h3>После сканирования посетитель становиться {roleText2}</h3>
		</div>
	);
}
