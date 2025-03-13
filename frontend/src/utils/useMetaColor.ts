import { useEffect } from "react"

export function useMetaColor(color: string | null)
{
	useEffect(() =>
	{
		if (!color) return;

		const themeMetaColor = document.querySelector('meta[name="theme-color"]');
		const prevColor = themeMetaColor?.getAttribute("content");
		themeMetaColor?.setAttribute("content", color);

		return () => { if (prevColor) themeMetaColor?.setAttribute("content", prevColor); }
	}, [color]);
}
