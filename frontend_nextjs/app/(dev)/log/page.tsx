"use client"
import { useLog, useLogCacheClear, useLogLen, type LogItem } from "@/api/log";
import styles from "./page.module.css"
import { datetimeToString } from "@/utils/dates";
import displayError from "@/utils/displayError";
import useStateObj from "@/utils/useStateObj";
import { useTitle } from "@/utils/useTtile";
import Button from "@sCmps/Button";

export default function LogPage()
{
	useTitle("Log");
	const clearCache = useLogCacheClear();
	const page = useStateObj(0);
	const log = useLog(page.v);
	const logLen = useLogLen().data?.len ?? 0;

	return <>
		{displayError(log)}
		<div className={styles.btns}>
			<Button text="Update" padding disabled={log.isFetching} onClick={() => { clearCache(); page.set(0); log.refetch(); }} />
			<Button text="&lt;&lt;" padding disabled={log.isFetching} onClick={() => page.set(0)} />
			<Button text="&lt;" padding disabled={log.isFetching} onClick={() => page.set(p => Math.max(p - 1, 0))} />
			<span>{page.v + 1}/{logLen}</span>
			<Button text="&gt;" padding disabled={log.isFetching} onClick={() => page.set(p => Math.min(p + 1, logLen - 1))} />
			<Button text="&gt;&gt;" padding disabled={log.isFetching} onClick={() => page.set(logLen - 1)} />
		</div>
		{log.isFetching && <h3>Загрузка</h3>}
		<table className={styles.table}>
			<thead>
				<tr>
					<th style={{ minWidth: "9.5em" }}>Date</th>
					<th style={{ minWidth: "4em" }}>Action</th>
					<th style={{ minWidth: "9.5em" }}>Table[id]</th>
					<th style={{ minWidth: "7em" }}>User[id]</th>
					<th style={{ minWidth: "14em" }}>Changes</th>
				</tr>
			</thead>
			<tbody>
				{log.data?.map(item => <tr key={item.id}>
					<td>{datetimeToString(item.date, true, true)}</td>
					<td>{colorizeAction(item.actionCode)}</td>
					<td>{item.tableName}[{item.recordId}]</td>
					<td>{item.userName} [{item.userId}]</td>
					<td>
						<div className={styles.changes}>
							<input type="checkbox" className={styles.toggleInp} id={`item${item.id}`} />
							<div>
								{item.changes.map(v => <div key={v[0]}>{v[0]}: {JSON.stringify(v[1])} {"->"} {JSON.stringify(v[2])}</div>)}
							</div>
							{item.changes.length > 0 &&
								<label className={styles.btn} htmlFor={`item${item.id}`}>{item.changes.length}</label>
							}
						</div>
					</td>
				</tr>)}
			</tbody>
		</table>
	</>
}

function colorizeAction(action: LogItem["actionCode"])
{
	const colors: { [key in LogItem["actionCode"]]: string } = {
		added: "#008000",
		deleted: "#b30000",
		updated: "#006fb3",
		restored: "#990099",
	}
	return <span style={{ color: colors[action] }}>{action}</span>
}
