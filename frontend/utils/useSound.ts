"use client"
import { useEffect, useRef } from "react";

export default function useSound(url: string, loop = false, onEnd?: () => void)
{
	const audio = useRef<HTMLAudioElement>(null);

	useEffect(() =>
	{
		const el = new Audio(url)
		el.preload = "auto";
		el.addEventListener("ended", () =>
		{
			if (loop && el == audio.current) el.play();
			if (onEnd) onEnd();
		});
		if (audio.current && !audio.current.paused)
			el.play();
		audio.current = el;
		// eslint-disable-next-line
	}, [url, loop]);

	useEffect(() => { const v = audio.current; return () => v?.pause() }, [audio.current]);

	return {
		el: audio.current,
		play: (reset: boolean = false, r?: (r: boolean) => void) =>
		{
			if (!audio.current) return;
			if (reset) audio.current.currentTime = 0;
			audio.current.play().then(() => r?.(true)).catch(() => r?.(false));
		},
		stop: () =>
		{
			audio.current?.pause();
		}
	};
};
