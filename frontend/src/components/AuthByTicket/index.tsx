import { useEffect, useRef } from "react";
import type { ImgData } from "../../api/dataTypes";
import classNames from "../../utils/classNames";
import imagefileToData from "../../utils/imagefileToData";
import useStateObj from "../../utils/useStateObj";
import styles from "./styles.module.css"

export default function AuthByTicket({ open }: AuthByTicketProps)
{
	const imgData = useStateObj<ImgData | null>(null);
	const scanner = useScanner(imgData.v);

	return (
		<div className={classNames(styles.root, open && styles.open, imgData.v && styles.scannerOpen)}>
			<div className={styles.body}>
				<div className={styles.message}>
					<div className={styles.message__fade}></div>
					<div className={styles.message__img}><div><div></div></div></div>
					<div className={styles.message__title}>Система</div>
					<div className={styles.message__text}>
						{!imgData.v ?
							"Обнаружено подключение! Протокол защиты активирован, требуется подтверждение доступа."
							:
							"Обработка потока данных! Требуется ручная корректировка для поиска QR-кода."
						}
					</div>
				</div>
				<label className={styles.openFile}>
					<div className={styles.openFile__fade}></div>
					<div>Открыть QR-код</div>
					<input
						type="file"
						style={{ display: "none" }}
						accept="image/png, image/jpeg, image/gif"
						onChange={async e =>
						{
							imgData.set({ data: "", name: "" });
							imgData.set(await imagefileToData(e.target?.files?.[0]!, ""));
							e.target.value = "";
						}}
					/>
				</label>
				<div className={styles.scanner}>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
					<div className={styles.scanner__fade}></div>
					<canvas ref={scanner.canvasRef}></canvas>
				</div>
				<button
					className={styles.btnScan}
					onClick={() =>
					{
						scanner.scan(data =>
						{
							console.log(data);
						}, () =>
						{
							console.log("error");
						});
					}}
				>
					<div className={styles.btnScan__fade}></div>
					<span>Сканировать!</span>
				</button>
			</div>
		</div>
	);
}

interface AuthByTicketProps
{
	open: boolean;
}

function useScanner(imgData: ImgData | null)
{
	const canvasRef = useRef<HTMLCanvasElement>(null);
	useEffect(() =>
	{
		if (!imgData) return;
		const canvas = canvasRef.current
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (parent == null) throw new Error("Canvas parent not found");
		canvas.style.width = "0px";
		canvas.style.height = "0px";
		const w = parent.clientWidth;
		const h = parent.clientHeight;
		canvas.width = w;
		canvas.style.width = `${w}px`;
		canvas.height = h;
		canvas.style.height = `${h}px`;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const imgEl = new Image();
		imgEl.onload = () =>
		{
			img.z = h / imgEl.height;
			img.w = imgEl.width * img.z;
			img.h = imgEl.height * img.z;
			img.x = (w - img.w) / 2;
			draw();
		};
		imgEl.src = imgData.data;

		const img = { x: 0, y: 0, w: 0, h: 0, z: 1 };
		const move = { active: false, sx: 0, sy: 0, six: 0, siy: 0 };
		const zoom = { active: false, sd: 0, sz: 0 };

		function draw()
		{
			if (!ctx) return;
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, w, h);
			ctx.drawImage(imgEl, img.x, img.y, img.w, img.h);
		}
		function rezoom(oldZ: number)
		{
			img.x -= w / 2;
			img.y -= h / 2;
			img.x /= oldZ;
			img.y /= oldZ;
			img.x *= img.z;
			img.y *= img.z;
			img.x += w / 2;
			img.y += h / 2;
			img.w = imgEl.width * img.z;
			img.h = imgEl.height * img.z;
			img.x = Math.max(Math.min(img.x, w / 2), -(img.w - w / 2));
			img.y = Math.max(Math.min(img.y, h / 2), -(img.h - h / 2));
		}
		canvas.onmousedown = e =>
		{
			move.active = true;
			move.sx = e.offsetX;
			move.sy = e.offsetY;
			move.six = img.x;
			move.siy = img.y;
		};
		canvas.onmousemove = e =>
		{
			if (move.active)
			{
				img.x = move.six + (e.offsetX - move.sx);
				img.y = move.siy + (e.offsetY - move.sy);
				img.x = Math.max(Math.min(img.x, w / 2), -(img.w - w / 2));
				img.y = Math.max(Math.min(img.y, h / 2), -(img.h - h / 2));
				draw();
			}
		};
		canvas.onmouseup = e =>
		{
			move.active = false;
		};
		canvas.onwheel = e =>
		{
			const z = img.z;
			if (e.deltaY < 0)
				img.z *= 1.1;
			else
				img.z /= 1.1;
			rezoom(z);
			draw();
		};
		canvas.ontouchstart = e =>
		{
			e.preventDefault();
			if (e.touches.length == 1)
			{
				move.active = true;
				move.sx = e.touches[0].clientX;
				move.sy = e.touches[0].clientY;
				move.six = img.x;
				move.siy = img.y;
			}
			else if (e.touches.length == 2)
			{
				move.active = false;
				zoom.active = true;
				const x1 = e.touches[0].clientX;
				const y1 = e.touches[0].clientY;
				const x2 = e.touches[1].clientX;
				const y2 = e.touches[1].clientY;
				const dx = (x1 - x2);
				const dy = (y1 - y2);
				zoom.sd = dx * dx + dy * dy;
				zoom.sz = img.z;
			}
		};
		canvas.ontouchmove = e =>
		{
			e.preventDefault();
			if (move.active)
			{
				img.x = move.six + (e.touches[0].clientX - move.sx);
				img.y = move.siy + (e.touches[0].clientY - move.sy);
				img.x = Math.max(Math.min(img.x, w / 2), -(img.w - w / 2));
				img.y = Math.max(Math.min(img.y, h / 2), -(img.h - h / 2));
				draw();
			}
			if (zoom.active)
			{
				const z = img.z;
				const x1 = e.touches[0].clientX;
				const y1 = e.touches[0].clientY;
				const x2 = e.touches[1].clientX;
				const y2 = e.touches[1].clientY;
				const dx = (x1 - x2);
				const dy = (y1 - y2);
				const d = dx * dx + dy * dy;
				img.z = zoom.sz * Math.sqrt(d / zoom.sd);
				rezoom(z);
				draw();
			}
		};
		canvas.ontouchend = e =>
		{
			e.preventDefault();
			move.active = false;
			zoom.active = false;
			if (e.touches.length == 1)
			{
				move.active = true;
				move.sx = e.touches[0].clientX;
				move.sy = e.touches[0].clientY;
				move.six = img.x;
				move.siy = img.y;
			}
		};
	}, [canvasRef, imgData]);
	async function scan(onSuccess: (data: string) => void, onError: () => void)
	{
		const canvas = canvasRef.current;
		if (!canvas) return onError();

		const url = canvas.toDataURL();

	}
	return { canvasRef, scan };
}
