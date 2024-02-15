import { useState } from "react";

export default function useStateBool(initialState: boolean | (() => boolean), onSet?: () => void)
{
	let [v, set] = useState(initialState)
	let setFn = set;
	if (onSet)
		setFn = (v: boolean | ((prevState: boolean) => boolean)) =>
		{
			set(v);
			onSet();
		};

	return {
		v,
		set: setFn,
		setT: () => set(true),
		setF: () => set(false),
	};
}
