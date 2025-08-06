import type { StaticImageData } from "next/image";
import { useEffect } from "react";

export default function usePreloadImgs(...imgs: StaticImageData[])
{
	useEffect(() =>
	{
		const els = imgs.map(v =>
		{
			const el = document.createElement("link");
			el.rel = "preload";
			el.href = v.src;
			el.as = "image";
			document.head.appendChild(el);
			return el;
		});
		return () =>
		{
			els.forEach(el => document.head.removeChild(el))
		}
	}, [imgs]);
}