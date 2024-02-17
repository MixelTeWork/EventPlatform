import { useState } from "react";

export default function useSound(url: string, loop = false)
{
	const [audio] = useState(() =>
	{
		const audio = new Audio(url)
		audio.preload = "auto";
		if (loop)
			audio.addEventListener("ended", audio.play);
		return audio;
	});

	const play = () =>
	{
		audio.currentTime = 0;
		audio.play();
	};

	return play;
};
