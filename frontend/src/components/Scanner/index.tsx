import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css"
import useScanner from "../../utils/useScanner";
import { UseMutationResult } from "react-query";
import { formatError } from "../../utils/displayError";
import Spinner from "../Spinner";
import classNames from "../../utils/classNames";

export default function Scanner<Res, Data>({ useMutation, onScan, formatMsg, className }: ScannerProps<Res, Data>)
{
	const [msg, setMsg] = useState("");
	const [err, setErr] = useState("");
	const barRef = useRef<HTMLDivElement>(null);
	const mutation = useMutation(r =>
	{
		setMsg(formatMsg(r));
		setErr("");
		setTimeout(() => mutation.reset(), 1000);
		setBar();
	}, err =>
	{
		setMsg("");
		setErr(formatError(err));
		setTimeout(() => mutation.reset(), 1000);
		setBar();
	});
	const { scanned, scanner } = useScanner(!mutation.isIdle);

	function setBar()
	{
		barRef.current?.classList.add(styles.bar_full);
		setTimeout(() => barRef.current?.classList.remove(styles.bar_full), 100);
	}

	useEffect(() =>
	{
		if (scanned == "" || !mutation.isIdle) return;
		setMsg("");
		setErr("");
		const data = onScan(scanned);
		if (data)
			mutation.mutate(data);
		else
			setErr("Не опознано");
	}, [scanned])

	return <div className={classNames(styles.root, className)}>
		{mutation.isLoading && <Spinner />}
		{scanner}
		<div className={classNames(styles.msg, (msg || err) && styles.msg_visible, (msg || err) && mutation.isIdle && styles.msg_dimmed)}>
			<h2>{msg}</h2>
			<h2>{err}</h2>
		</div>
		<div ref={barRef} className={styles.bar}></div>
	</div>
}

interface ScannerProps<Res, Data>
{
	useMutation: (onSuccess: (data: Res) => void, onError: (err: any) => void) => UseMutationResult<Res, any, Data, unknown>,
	onScan: (scanned: string) => Data | null,
	formatMsg: (res: Res) => string,
	className?: string,
}
