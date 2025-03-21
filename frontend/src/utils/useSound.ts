import { useEffect } from "react";
import useStateObj from "./useStateObj";

export default function useSound(url: string, loop = false)
{
	const audio = useStateObj<HTMLAudioElement>(new Audio());

	useEffect(() =>
	{
		audio.set(old =>
		{
			const audio = new Audio(url)
			audio.preload = "auto";
			if (loop)
				audio.addEventListener("ended", audio.play);
			if (!old.paused)
				audio.play();
			return audio;
		});
		// eslint-disable-next-line
	}, [url, loop]);

	useEffect(() => { const v = audio.v; return () => v.pause()}, [audio.v]);

	return {
		play: (r?: (r: boolean) => void) =>
		{
			audio.v.currentTime = 0;
			audio.v.play().then(() => r?.(true)).catch(() => r?.(false));
		},
		stop: () =>
		{
			audio.v.pause();
		}
	};
};
