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

export function useStateList<T>(initialState: T[] | (() => T[]) = [] as T[], onSet?: (v: T[], pv: T[]) => void): StateList<T>
{
	const state = useStateObj(initialState, onSet);
	return {
		...state,
		setI: (i, v) => state.set(old =>
		{
			const list = [...old];
			list[i] = v;
			return list;
		}),
		push: (v, i) => state.set(old =>
		{
			const list = [...old];
			if (i != undefined) list.splice(i, 0, v);
			else list.push(v);
			return list;
		}),
		pop: (i) => state.set(old =>
		{
			const list = [...old];
			if (i != undefined) list.splice(i, 1);
			else list.pop();
			return list;
		}),
	};
}

export interface StateObjNullable<S> extends StateObj<S>
{
	setNull: () => void,
}

export interface StateList<T> extends StateObj<T[]>
{
	setI: (i: number, v: T) => void,
	push: (v: T, i?: number) => void,
	pop: (i?: number) => void,
}
