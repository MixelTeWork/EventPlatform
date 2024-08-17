import { useEffect } from "react";
import useStateObj from "./useStateObj";
import useStateBool from "./useStateBool";

export default function useSound(url: string, loop = false)
{
	const audio = useStateObj<HTMLAudioElement>(new Audio());
	const playing = useStateBool(false);

	useEffect(() =>
	{
		audio.set(() =>
		{
			const audio = new Audio(url)
			audio.preload = "auto";
			if (loop)
				audio.addEventListener("ended", audio.play);
			if (playing.v)
				audio.play();
			return audio;
		});
		// eslint-disable-next-line
	}, [url, loop]);

	useEffect(() =>
	{
		if (playing.v)
		{
			audio.v.currentTime = 0;
			audio.v.play();
		}
		else
		{
			audio.v.pause();
		}
	}, [playing.v, audio.v])

	return { play: playing.setT, stop: playing.setF };
};
