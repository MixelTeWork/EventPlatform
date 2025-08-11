import { useState } from "react";

export default function useStateObj<S>(initialState: S | (() => S), onSet?: (v: S, pv: S) => void): StateObj<S>
{
	const [v, set] = useState(initialState)
	let setFn = set;
	let setFnS = set;
	if (onSet)
	{
		const fn = (v: S | ((prevState: S) => S), triggerOnSet: boolean) =>
			set(pv =>
			{
				const nv = v instanceof Function ? v(pv) : v;
				if (triggerOnSet)
					onSet(nv, pv);
				return nv;
			});
		setFn = (v: S | ((pv: S) => S)) => fn(v, true);
		setFnS = (v: S | ((pv: S) => S)) => fn(v, false);
	}

	return {
		v,
		set: setFn,
		setSilent: setFnS,
	};
}

export interface StateObj<S>
{
	v: S;
	set: React.Dispatch<React.SetStateAction<S>>;
	setSilent: React.Dispatch<React.SetStateAction<S>>;
}

export function useStateObjNull<S, T = S | null>(initialState: T | (() => T) = null as T, onSet?: (v: T, pv: T) => void): StateObjNullable<T>
{
	const state = useStateObj(initialState, onSet);
	return { ...state, setNull: () => state.set(null as T) };
}

export interface StateObjNullable<S> extends StateObj<S>
{
	setNull: () => void,
}