import { useEffect } from "react"

export function useTitle(title: string | (string | undefined | null | false)[], prefix = "Underparty")
{
	useEffect(() =>
	{
		const prevTitle = document.title;
		const t = typeof title != "object" ? [title] : title;
		document.title = [prefix, ...t].filter(v => !!v).join(" | ");
		return () => { document.title = prevTitle; }
	}, [title, prefix]);
}
