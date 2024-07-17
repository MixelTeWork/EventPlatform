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

export function useStateObjExt<S>(initialState: S | (() => S), onSet?: (v: S, pv: S) => void)
{
	const [v, set] = useState(initialState)
	if (onSet)
		return {
			v, set: (v: S | ((prevState: S) => S), disableOnSet = false) =>
			{
				set(pv =>
				{
					const nv = v instanceof Function ? v(pv) : v;
					if (!disableOnSet)
						onSet(nv, pv);
					return nv;
				});
			}
		};
	return { v, set };
}
