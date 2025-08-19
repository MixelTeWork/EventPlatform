"use client"
import styles from "./styles.module.css"
import { useEffect, useState } from "react";
import clsx from "@/utils/clsx";
import getMsgFromBack from "@/api/getMsgFromBack";

let msg = "";
export default function MessageFromBackend()
{
	const [message, setMessage] = useState("");

	useEffect(() =>
	{
		const timer = setInterval(() =>
		{
			const msgCur = getMsgFromBack() || "";
			if (msgCur != msg)
			{
				msg = msgCur;
				setMessage(msg);
			}
		}, 1000);
		return () =>
		{
			clearInterval(timer);
		}
	}, [setMessage])

	return (
		<div className={clsx(styles.root, message != "" && styles.visible)}>
			<button
				className={styles.close}
				onClick={() => setMessage("")}
			></button>
			<div className={styles.message}>{trimQuotes(message)}</div>
		</div>
	);
}

function trimQuotes(str: string)
{
	if (str.slice(0, 1) == '"') str = str.slice(1);
	if (str.slice(-1) == '"') str = str.slice(0, -1);
	return str;
}
