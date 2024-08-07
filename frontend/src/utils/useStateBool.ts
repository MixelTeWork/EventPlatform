import { useState } from "react";

export default function useStateBool(initialState: boolean | (() => boolean), onSet?: () => void): StateBool
{
	const [v, set] = useState(initialState)
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
		setT: () => setFn(true),
		setF: () => setFn(false),
		toggle: () => setFn(v => !v),
	};
}

export interface StateBool
{
	v: boolean;
	set: React.Dispatch<React.SetStateAction<boolean>>;
	setT: () => void;
	setF: () => void;
	toggle: () => void;
}
