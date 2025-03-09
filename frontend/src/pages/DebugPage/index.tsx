import { useRef, useState } from "react";
import styles from "./styles.module.css"
import Layout from "../../components/Layout"
import Popup from "../../components/Popup";
import { Link } from "react-router-dom";

export default function DebugPage()
{
	const [log, setLog] = useState("");
	const [logTitle, setLogTitle] = useState("Log");
	const refLog = useRef<HTMLPreElement>(null);

	const viewLog = (title: string, path: string) => async () =>
	{
		setLogTitle(title)
		setLog("Loading");
		try
		{
			const res = await fetch(path);
			const data = await res.text();
			setLog(data);
			setTimeout(() => refLog.current?.parentElement?.scrollTo(0, refLog.current?.parentElement?.scrollHeight), 150);
		}
		catch (x) { setLog(JSON.stringify(x)); }
	}

	return (
		<Layout centered gap="1rem" className={styles.root} homeBtn>
			<Link to="/users">Users</Link>
			<Link to="/log">Log</Link>
			<button onClick={viewLog("Log errors", "/api/debug/log_errors")}>Log errors</button>
			<button onClick={viewLog("Log info", "/api/debug/log_info")}>Log info</button>
			<button onClick={viewLog("Log requests", "/api/debug/log_requests")}>Log requests</button>
			<button onClick={viewLog("Log frontend", "/api/debug/log_frontend")}>Log frontend</button>
			<Popup title={logTitle} open={log != ""} close={() => setLog("")}>
				<pre ref={refLog}>{log}</pre>
			</Popup>
		</Layout>
	);
}
