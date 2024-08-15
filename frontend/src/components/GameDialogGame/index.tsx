import { useEffect } from "react";
import useUser, { useMutationOpenGame } from "../../api/user";
import useGameDialog from "../GameDialog";

export default function GameDialogGame()
{
	const user = useUser();
	const dialog = useGameDialog();
	const markAsOpen = useMutationOpenGame();

	useEffect(() =>
	{
		if (user.data && !user.data.gameOpened)
			dialog.run(2, () => markAsOpen.mutate());
		// eslint-disable-next-line
	}, [user.data])

	return <>
		{dialog.el()}
	</>;
}
