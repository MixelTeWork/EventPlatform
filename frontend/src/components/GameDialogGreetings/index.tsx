import { useEffect } from "react";
import useUser from "../../api/user";
import useGameDialog from "../GameDialog";
import SelectGroup from "./SelectGroup";
import useStateBool from "../../utils/useStateBool";

export default function GameDialogGreetings()
{
	const user = useUser();
	const dialog = useGameDialog();
	const selectGroup = useStateBool(false);

	useEffect(() =>
	{
		if (user.data?.group == 0)
			dialog.run(1, selectGroup.setT);
		// eslint-disable-next-line
	}, [user.data])

	return <>
		{dialog.el()}
		{selectGroup.v && <SelectGroup close={selectGroup.setF} />}
	</>;
}
