import { useState } from "react";

export default function useStateObj<S>(initialState: S | (() => S), onSet?: () => void)
{
	const [v, set] = useState(initialState)
	if (onSet)
		return {
			v, set: (v: S | ((prevState: S) => S)) =>
			{
				set(v);
				onSet();
			}
		};
	return { v, set };
}
