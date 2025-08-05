import { useState } from "react";

export default function useStateObj<S>(initialState: S | (() => S), onSet?: () => void): StateObj<S>
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

export interface StateObj<S>
{
	v: S;
	set: React.Dispatch<React.SetStateAction<S>>;
}

export function useStateObjExt<S>(initialState: S | (() => S), onSet: (v: S, pv: S) => void)
{
	const [v, set] = useState(initialState)
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
}
