import { useRef, useState } from "react";
import styles from "./styles.module.css"
import Layout from "../../components/Layout"
import Popup from "../../components/Popup";
import { Link } from "react-router-dom";

export default function DebugPage()
{
	const [logErrors, setLogErrors] = useState("");
	const [logFrontend, setLogFrontend] = useState("");
	const [log, setLog] = useState("");
	const refLogErrors = useRef<HTMLPreElement>(null);
	const refLogFrontend = useRef<HTMLPreElement>(null);
	const refLog = useRef<HTMLPreElement>(null);

	return (
		<Layout centered gap="1rem" className={styles.root} homeBtn>
			<Link to="/users">Users</Link>
			<Link to="/log">Log</Link>
			<button onClick={async () =>
			{
				setLogErrors("Loading");
				try
				{
					const res = await fetch("/api/debug/log_errors");
					const data = await res.text();
					setLogErrors(data);
					setTimeout(() => refLogErrors.current?.parentElement?.scrollTo(0, refLogErrors.current?.parentElement?.scrollHeight), 150);
				}
				catch (x) { setLogErrors(JSON.stringify(x)); }
			}}>Log errors</button>
			<button onClick={async () =>
			{
				setLog("Loading");
				try
				{
					const res = await fetch("/api/debug/log_info");
					const data = await res.text();
					setLog(data);
					setTimeout(() => refLog.current?.parentElement?.scrollTo(0, refLog.current?.parentElement?.scrollHeight), 150);
				}
				catch (x) { setLog(JSON.stringify(x)); }
			}}>Log requests</button>
			<button className="button" onClick={async () =>
			{
				setLogFrontend("Loading");
				try
				{
					const res = await fetch("/api/debug/log_frontend");
					const data = await res.text();
					setLogFrontend(data);
					setTimeout(() => refLogFrontend.current?.parentElement?.scrollTo(0, refLogFrontend.current?.parentElement?.scrollHeight), 150);
				}
				catch (x) { setLogFrontend(JSON.stringify(x)); }
			}}>Log frontend</button>
			<Popup title="logErrors" open={logErrors != ""} close={() => setLogErrors("")}>
				<pre ref={refLogErrors}>{logErrors}</pre>
			</Popup>
			<Popup title="logFrontend" open={logFrontend != ""} close={() => setLogFrontend("")}>
				<pre ref={refLogFrontend}>{logFrontend}</pre>
			</Popup>
			<Popup title="log" open={log != ""} close={() => setLog("")}>
				<pre ref={refLog}>{log}</pre>
			</Popup>
		</Layout>
	);
}
