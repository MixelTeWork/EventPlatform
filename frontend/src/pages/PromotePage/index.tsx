import Layout from "../../components/Layout";
import QrCode from "../../components/QrCode";
import { useTitle } from "../../utils/useTtile";
import styles from "./styles.module.css"

export default function PromotePage({ role }: PromoteProps)
{
	useTitle("Повышение");
	const roleText = {
		"worker": "волонтёра",
		"manager": "управляющего",
	}[role];
	const roleText2 = {
		"worker": "волонтёром",
		"manager": "управляющим",
	}[role];
	if (!roleText) return <Layout>Ошибка!</Layout>;

	return (
		<Layout centered gap="1rem" height100 className={styles.root}>
			<h1>Повышение до {roleText}</h1>
			<div className={styles.qr}>
				<QrCode code={`promote_${role}`} colorBg="#ffffff00" scale={13} />
			</div>
			<h3>После сканирования посетитель становиться {roleText2}</h3>
		</Layout>
	);
}

interface PromoteProps
{
	role: "worker" | "manager",
}
