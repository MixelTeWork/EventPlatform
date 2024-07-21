import { useEffect } from "react";
import useUser, { useMutationSetGroup } from "../../api/user";
import useGameDialog from "../GameDialog";

export default function GameDialogGreetings()
{
	const user = useUser();
	const dialog = useGameDialog();
	const seeGreet = useMutationSetGroup();

	useEffect(() =>
	{
		if (user.data?.group == 0)
			dialog.run(1, () => seeGreet.mutate({ group: 1 }));
	// eslint-disable-next-line
	}, [user.data])

	return dialog.el();
}
