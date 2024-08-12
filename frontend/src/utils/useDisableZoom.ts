import { useEffect } from "react"

export function useDisableZoom()
{
	useEffect(() =>
	{
		const meta = document.querySelector('meta[name="viewport"]');
		if (!meta) return;
		const content = meta.getAttribute("content") || "";
		console.log(content);
		meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
		return () => meta.setAttribute("content", content);
	}, []);
}
