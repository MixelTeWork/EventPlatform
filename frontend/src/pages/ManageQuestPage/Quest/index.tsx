import { useEffect } from "react";
import PopupConfirm from "../../../components/PopupConfirm";
import Spinner from "../../../components/Spinner";
import classNames from "../../../utils/classNames";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import { useMutationEditQuest, type Quest, useMutationDeleteQuest } from "../../../api/quest";

export default function Quest({ quest }: QuestProps)
{
	const changed = useStateBool(false);
	const deleting = useStateBool(false);
	const name = useStateObj(quest.name, changed.setT);
	const reward = useStateObj(quest.reward, changed.setT);

	const mutationEdit = useMutationEditQuest(quest.id, reset, () => reset());

	function reset(newQuest?: Quest)
	{
		name.set(newQuest?.name || quest.name);
		reward.set(newQuest?.reward || quest.reward);
		changed.setF();
	}

	useEffect(reset, [quest])

	return (
		<div className={classNames(styles.root, changed.v && styles.changed)}>
			{mutationEdit.isLoading && <Spinner block r="0.5rem" />}
			{displayError(mutationEdit, err => <div className={styles.error}>
				<div>{err}</div>
				<button onClick={() => mutationEdit.reset()}>ОК</button>
			</div>)}
			<PopupConfirm title={"Удалить товар: " + name.v} itemId={quest.id} mutationFn={useMutationDeleteQuest} open={deleting.v} close={deleting.setF} />
			<div className={styles.id}>{quest.id}</div>
			<div className={styles.inputs}>
				<div>Название</div>
				<input type="text" value={name.v} onChange={inp => name.set(inp.target.value)} />
				<div>Награда</div>
				<input type="number" value={reward.v} onChange={inp => reward.set(inp.target.valueAsNumber)} />
			</div>
			<div className={classNames("material_symbols", styles.buttons)}>
				{!changed.v && <button onClick={deleting.setT}>delete</button>}
				{changed.v && <button

					onClick={() =>
					{
						mutationEdit.mutate({
							name: name.v,
							reward: reward.v,
						});
					}}
				>
					save
				</button>}
				{changed.v && <button onClick={() => reset()}>cancel</button>}
			</div>
		</div>
	);
}

interface QuestProps
{
	quest: Quest
}