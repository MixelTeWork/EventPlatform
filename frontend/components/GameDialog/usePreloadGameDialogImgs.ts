import { useEffect } from "react";
import { useDialogCharacters } from "@/api/dialog";

export default function usePreloadGameDialogImgs()
{
	const characters = useDialogCharacters();
	useEffect(() =>
	{
		if (!characters.data) return;
		const els = Object.values(characters.data).map(v =>
		{
			const el = document.createElement("link");
			el.rel = "preload";
			el.href = v.img;
			el.as = "image";
			document.head.appendChild(el);
			return el;
		});
		return () =>
		{
			els.forEach(el => document.head.removeChild(el))
		}
	}, [characters.data]);
}