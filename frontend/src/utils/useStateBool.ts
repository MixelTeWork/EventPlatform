import { useState } from "react";

export default function useStateBool(initialState: boolean | (() => boolean), onSet?: () => void)
{
	let [v, set] = useState(initialState)
	if (onSet)
		set = (v: boolean | ((prevState: boolean) => boolean)) =>
		{
			set(v);
			onSet();
		};

	return {
		v,
		set,
		setT: () => set(true),
		setF: () => set(false),
	};
}
