import { useMutationPromoteManager, useMutationPromoteWorker } from "../../api/promote";
import Layout from "../../components/Layout";
import Scanner from "../../components/Scanner";
import styles from "./styles.module.css"

export default function PromotePage({ role }: PromoteProps)
{
	const roleText = {
		"worker": "волонтёра",
		"manager": "управляющего",
	}[role];
	const roleText2 = {
		"worker": "волонтёр",
		"manager": "управляющий",
	}[role];
	if (!roleText) return <Layout>Ошибка!</Layout>;

	return (
		<Layout className={styles.root}>
			<div className={styles.title}>
				<h3>
					Просканируйте qr-код человек, чтобы повысить его до {roleText}.
				</h3>
			</div>

			<Scanner
				useMutation={{
					"worker": useMutationPromoteWorker,
					"manager": useMutationPromoteManager,
				}[role]}
				onScan={scanned =>
				{
					if (!scanned.startsWith("user_"))
						return null;
					const userId = scanned.slice("user_".length);
					return { userId };
				}}
				formatMsg={r => ({
					"ok": `${r.user} повышен до ${roleText}`,
					"already_has": `${r.user} уже ${roleText2}`,
					"no_user": "Человек не найден",
				}[r.res] || r.res)}
			/>
		</Layout>
	);
}

interface PromoteProps
{
	role: "worker" | "manager",
}
