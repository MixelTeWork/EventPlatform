import useStateObj, { type StateObj } from "./useStateObj";

export default function useStateBool(initialState: boolean | (() => boolean), onSet?: (v: boolean) => void): StateBool
{
	const state = useStateObj(initialState, onSet);

	return {
		...state,
		setT: () => state.set(true),
		setF: () => state.set(false),
		toggle: () => state.set(v => !v),
	};
}

export interface StateBool extends StateObj<boolean>
{
	setT: () => void;
	setF: () => void;
	toggle: () => void;
}
