import { useEffect } from "react";

export default function usePreloadImgs(...imgs: string[])
{
	useEffect(() =>
	{
		const els = imgs.map(v =>
		{
			const el = document.createElement("link");
			el.rel = "preload";
			el.href = v;
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