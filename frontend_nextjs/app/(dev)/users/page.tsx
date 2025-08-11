"use client"
import styles from "./page.module.css"
import { useUsers } from "@/api/user";
import displayError from "@/utils/displayError";
import { useTitle } from "@/utils/useTtile";

export default function UsersPage()
{
	useTitle("Users");
	const users = useUsers()

	return (
		<>
			{users.isLoading && <h3>Загрузка</h3>}
			{displayError(users)}
			{users.data?.map(v => <div className={styles.user} key={v.id}>
				<input type="checkbox" className={styles.toggleInp} id={`user${v.id}`} />
				<label className={styles.title} htmlFor={`user${v.id}`}>
					<div>
						<div>{v.login}</div>
						<div style={{ color: "lightblue" }}>{v.id}</div>
						<div>|</div>
						<div>{v.name}</div>
					</div>
					<div>
						{v.deleted && <>
							<div style={{ color: "tomato" }}>deleted</div>
							<div>|</div>
						</>}
						<span>{v.roles.join(", ")}</span>
						<div className={styles.toggle}></div>
					</div>
				</label>
				<div className={styles.userInfo}>
					<div>
						<h4>Operations</h4>
						<div className={styles.operations}>
							{v.operations.map((o, i) => <div key={i}>{colorizeOperation(o)}</div>)}
						</div>
					</div>
				</div>
			</div>)}
		</>
	);
}

function colorizeOperation(operation: string)
{
	const colors = {
		page: "#ff95ff",
		add: "#00b100",
		get: "#00b100",
		change: "#66c5ff",
		manage: "#66c5ff",
		delete: "#ff6666",
	}
	for (const prefix in colors)
	{
		if (operation.startsWith(prefix))
			return <>
				<span style={{ color: colors[prefix as keyof typeof colors] }}>{prefix}</span>
				<span>{operation.slice(prefix.length)}</span>
			</>
	}
	return <span>{operation}</span>
}