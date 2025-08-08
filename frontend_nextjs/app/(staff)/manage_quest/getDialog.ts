import type { Dialog, GameDialogData } from "@/api/dialog";
import copyObj from "@/utils/copyObj";
import type { StateObj } from "@/utils/useStateObj";
import type { UseQueryResult } from "@tanstack/react-query";

export default async function getDialog(state: StateObj<GameDialogData | null>, query: UseQueryResult<Dialog, unknown>, fn: (dialog: GameDialogData) => void)
{
	if (state.v) fn(state.v);
	else if (query.isSuccess && !query.isStale)
	{
		const data = copyObj(query.data.data);
		state.set(data);
		fn(data);
	}
	else
	{
		const d = await query.refetch({ cancelRefetch: false });
		if (d.isSuccess)
		{
			const data = copyObj(d.data.data);
			state.set(data);
			fn(data);
		}
	}
}