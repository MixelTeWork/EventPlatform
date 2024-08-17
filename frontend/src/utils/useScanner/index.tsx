import styles from "./styles.module.css"
import beep from "./beep.mp3";
import { useEffect, useState } from "react";
import useSound from "../useSound";
import QrScanner from "qr-scanner";

let onScan = (r: string) => { };
let onError = () => { };
let error = false;
let scannerEl: HTMLDivElement | null = null;
let scanner: QrScanner | null = null;

export default function useScanner(pause = false, afterScanTimeout = 500)
{
	if (!scanner)
	{
		scannerEl = document.createElement("div");
		document.body.appendChild(scannerEl);
		scannerEl.style.display = "flex";
		scannerEl.style.backgroundColor = "black";

		const video = document.createElement("video");
		scannerEl.appendChild(video);
		scanner = new QrScanner(
			video,
			result => onScan(result.data),
			{
				highlightScanRegion: true,
				maxScansPerSecond: 10,
			},
		);
	}

	useEffect(() =>
	{
		setTimeout(() =>
			scanner?.start().catch(() =>
			{
				setTimeout(() =>
				{
					scanner?.start().catch(() => onError());
				}, 250)
			}), 100)
		return () =>
		{
			scanner?.stop();
		}
	}, []);

	const [isTimeout, setIsTimeout] = useState(false);
	const [scanned, setScanned] = useState("");
	const [isError, setIsError] = useState(error);
	const playBeep = useSound(beep);

	onScan = (r: string) =>
	{
		if (isTimeout || pause) return;
		setScanned(r);
		setIsTimeout(true);
		playBeep.play();
		setTimeout(() =>
		{
			setScanned("");
			setIsTimeout(false);
		}, afterScanTimeout);
	}
	onError = () =>
	{
		error = true;
		setIsError(true);
	}

	if (isError)
		return {
			scanned,
			scanner: <div className={styles.error}>
				<h1>Нет доступа к камере</h1>
				<p>Разрешите использование камеры этому сайту и браузеру, который вы используте.</p>
				<p>После перезагрузите страницу.</p>
			</div>
		};

	return {
		scanned,
		scanner: <div>
			<div
				ref={ref =>
				{
					if (!ref) return;
					ref.innerHTML = "";
					ref.appendChild(scannerEl!);
				}}
				className={styles.video}
			></div>
		</div>
	};
}
