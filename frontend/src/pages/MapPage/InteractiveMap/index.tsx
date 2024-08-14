import { useEffect, useRef } from "react";
import styles from "./styles.module.css"
import useStateObj from "../../../utils/useStateObj";

export default function InteractiveMap({ img, imgW, imgH, objects, objectsOpacity = 1, zoomMin = 0.8, zoomMax = 1, disablePadding = false, fillOnStart = false }: InteractiveMapProps)
{
	const mapEl = useRef<HTMLDivElement>(null);
	const state = useStateObj<MapState>({
		x: 0,
		y: 0,
		w: imgW,
		h: imgH,
		zoom: 1,
		toCenter: true,
		markClick: undefined,
		window: {
			w: 0,
			h: 0,
		},
		moving: {
			active: false,
			sx: 0,
			sy: 0,
			six: 0,
			siy: 0,
		},
		zooming: {
			active: false,
			sd: 0,
			sz: 0,
		},
	});

	useEffect(
		() => state.set(v => ({ ...v, s: 0, y: 0, w: imgW, h: imgH, zoom: 1, toCenter: true })),
		// eslint-disable-next-line
		[img, imgH, imgW]
	);
	useEffect(() =>
	{
		if (!mapEl.current) return;
		const el = mapEl.current;
		function setSize()
		{
			state.set(v =>
			{
				v.window.w = el.clientWidth;
				v.window.h = el.clientHeight;
				if (v.toCenter)
				{
					v.toCenter = false;
					if (fillOnStart)
						v.zoom = Math.max(v.window.w / imgW, v.window.h / imgH);
					else
						v.zoom = Math.min(v.window.w / imgW, v.window.h / imgH);
					v.w = imgW * v.zoom;
					v.h = imgH * v.zoom;
					v.x = (v.window.w - v.w) / 2;
					v.y = (v.window.h - v.h) / 2;
				}
				return { ...v };
			});
		}
		setSize();
		window.addEventListener("resize", setSize);
		return () =>
		{
			window.removeEventListener("resize", setSize);
		}
		// eslint-disable-next-line
	}, [mapEl, state.v.toCenter, imgH, imgW]);

	useEffect(() =>
	{
		if (!mapEl.current) return;
		const el = mapEl.current;

		function onMouseDown(e: MouseEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				v.moving.active = true;
				v.moving.sx = e.screenX;
				v.moving.sy = e.screenY;
				v.moving.six = v.x;
				v.moving.siy = v.y;
				return { ...v };
			});
		}
		function onMouseMove(e: MouseEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				if (!v.moving.active) return v;
				const dx = (e.screenX - v.moving.sx);
				const dy = (e.screenY - v.moving.sy);
				v.x = v.moving.six + dx;
				v.y = v.moving.siy + dy;
				const d = dx * dx + dy * dy;
				if (d > 100) v.markClick = undefined;
				applyBoundaries(v);
				return { ...v };
			});
		}
		function onMouseUp(e: MouseEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				v.moving.active = false;
				if (v.markClick)
				{
					const markClick = v.markClick;
					v.markClick = undefined;
					setTimeout(markClick);
				}
				return { ...v };
			});
		}
		function rezoom(v: MapState, oldZ: number)
		{
			v.zoom = Math.max(Math.min(v.zoom, zoomMax), Math.min(v.window.w / imgW, v.window.h / imgH) * zoomMin);
			v.x -= v.window.w / 2;
			v.y -= v.window.h / 2;
			v.x /= oldZ;
			v.y /= oldZ;
			v.x *= v.zoom;
			v.y *= v.zoom;
			v.x += v.window.w / 2;
			v.y += v.window.h / 2;
			v.w = imgW * v.zoom;
			v.h = imgH * v.zoom;
			applyBoundaries(v);
		}
		function applyBoundaries(v: MapState)
		{
			if (disablePadding)
			{
				if (v.w < v.window.w)
					v.x = (v.window.w - v.w) / 2;
				else
					v.x = Math.max(Math.min(v.x, 0), -(v.w - v.window.w));
				if (v.h < v.window.h)
					v.y = (v.window.h - v.h) / 2;
				else
					v.y = Math.max(Math.min(v.y, 0), -(v.h - v.window.h));
			}
			else
			{
				v.x = Math.max(Math.min(v.x, v.window.w / 2), -(v.w - v.window.w / 2));
				v.y = Math.max(Math.min(v.y, v.window.h / 2), -(v.h - v.window.h / 2));
			}
		}
		function onWheel(e: WheelEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				const z = v.zoom;
				v.zoom = e.deltaY < 0 ? v.zoom * 1.1 : v.zoom / 1.1;
				rezoom(v, z);
				return { ...v };
			});
		}
		function onTouchStart(e: TouchEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				if (e.touches.length == 1)
				{
					v.moving.active = true;
					v.moving.sx = e.touches[0].clientX;
					v.moving.sy = e.touches[0].clientY;
					v.moving.six = v.x;
					v.moving.siy = v.y;
					return { ...v };
				}
				else if (e.touches.length == 2)
				{
					v.moving.active = false;
					v.zooming.active = true;
					const x1 = e.touches[0].clientX;
					const y1 = e.touches[0].clientY;
					const x2 = e.touches[1].clientX;
					const y2 = e.touches[1].clientY;
					const dx = (x1 - x2);
					const dy = (y1 - y2);
					v.zooming.sd = dx * dx + dy * dy;
					v.zooming.sz = v.zoom;
					return { ...v };
				}
				return v;
			});
		};
		function onTouchMove(e: TouchEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				if (v.moving.active && e.touches.length == 1)
				{
					const dx = (e.touches[0].clientX - v.moving.sx);
					const dy = (e.touches[0].clientY - v.moving.sy);
					v.x = v.moving.six + dx;
					v.y = v.moving.siy + dy;
					const d = dx * dx + dy * dy;
					if (d > 100) v.markClick = undefined;
					applyBoundaries(v);
					return { ...v };
				}
				if (v.zooming.active && e.touches.length == 2)
				{
					const z = v.zoom;
					const x1 = e.touches[0].clientX;
					const y1 = e.touches[0].clientY;
					const x2 = e.touches[1].clientX;
					const y2 = e.touches[1].clientY;
					const dx = (x1 - x2);
					const dy = (y1 - y2);
					const d = dx * dx + dy * dy;
					v.zoom = v.zooming.sz * Math.sqrt(d / v.zooming.sd);
					v.markClick = undefined;
					rezoom(v, z);
					return { ...v };
				}
				return v;
			});
		};
		function onTouchEnd(e: TouchEvent)
		{
			e.preventDefault();
			state.set(v =>
			{
				v.moving.active = false;
				v.zooming.active = false;
				if (e.touches.length == 1)
				{
					v.moving.active = true;
					v.moving.sx = e.touches[0].clientX;
					v.moving.sy = e.touches[0].clientY;
					v.moving.six = v.x;
					v.moving.siy = v.y;
				}
				if (v.markClick)
				{
					const markClick = v.markClick;
					v.markClick = undefined;
					setTimeout(markClick);
				}
				return { ...v };
			});
		};
		el.addEventListener("wheel", onWheel);
		el.addEventListener("mousedown", onMouseDown);
		el.addEventListener("mousemove", onMouseMove);
		el.addEventListener("mouseup", onMouseUp);
		el.addEventListener("touchstart", onTouchStart);
		el.addEventListener("touchmove", onTouchMove);
		el.addEventListener("touchend", onTouchEnd);
		return () =>
		{
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("mousedown", onMouseDown);
			el.removeEventListener("mousemove", onMouseMove);
			el.removeEventListener("mouseup", onMouseUp);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
			el.removeEventListener("touchend", onTouchEnd);
		}
		// eslint-disable-next-line
	}, [mapEl, zoomMin, zoomMax, disablePadding, imgH, imgW])

	function setMarkClick(onClick: (() => void) | undefined)
	{
		state.set(v =>
		{
			v.markClick = onClick;
			return { ...v };
		})
	}

	return (
		<div className={styles.root} ref={mapEl}>
			<div className={styles.map} style={{
				"--x": `${state.v.x}px`,
				"--y": `${state.v.y}px`,
				"--w": `${state.v.w}px`,
				"--h": `${state.v.h}px`,
			} as React.CSSProperties}>
				<img src={img} alt="Карта" />
				{((objects || []).filter(v => !!v) as MapObject[]).map((v, i) => <div
					key={i}
					className={styles.mark}
					onMouseDown={() => setMarkClick(v.onClick)}
					onTouchStart={() => setMarkClick(v.onClick)}
					style={{
						left: `${v.x}%`,
						top: `${v.y}%`,
						width: `${v.w}%`,
						height: `${v.h}%`,
						opacity: objectsOpacity,
					}}
				>
					<img src={v.img} alt="Метка" />
					<div className={styles.mark__mark} style={{ "animationDelay": `-${i * 150}ms` }}>!</div>
				</div>)}
			</div>
		</div>
	);
}

interface InteractiveMapProps
{
	img: string;
	imgW: number;
	imgH: number;
	zoomMin?: number;
	zoomMax?: number;
	disablePadding?: boolean;
	fillOnStart?: boolean;
	objectsOpacity?: number;
	objects?: (MapObject | null)[];
}
interface MapObject
{
	x: number;
	y: number;
	w: number;
	h: number;
	img: string;
	onClick?: () => void;
}

interface MapState
{
	x: number;
	y: number;
	w: number;
	h: number;
	zoom: number;
	toCenter: boolean;
	markClick: (() => void) | undefined;
	window: {
		w: number,
		h: number,
	}
	moving: {
		active: boolean;
		sx: number;
		sy: number;
		six: number;
		siy: number;
	}
	zooming: {
		active: boolean,
		sd: number,
		sz: number,
	}
}