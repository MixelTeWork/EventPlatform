import styles from "./styles.module.css"
import { createEmptyCharacter, useDialogCharacters, type GameDialogCharacterData } from "@/api/dialog";
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import useStateObj from "@/utils/useStateObj";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import Character from "./Character";
import Button from "@sCmps/Button";

export default function ManageCharacters()
{
	const popupOpen = useStateBool(false);
	const characters = useDialogCharacters();
	const charactersNew = useStateObj<GameDialogCharacterData>({});
	const lastId = useStateObj(1);

	return <>
		<Button text="Управление персонажами" onClick={popupOpen.setT} />
		<Popup title="Управление персонажами" openState={popupOpen}
			footer={<Button text="Добавить" className={styles.addBtn} onClick={() =>
				charactersNew.set(v =>
				{
					const nv = { ...v };
					nv[-lastId.v] = createEmptyCharacter(-lastId.v);
					lastId.set(v => v + 1);
					return nv;
				})}
			/>}
		>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
			{characters.isSuccess && <>
				<div className={styles.characters}>
					{Object.values(characters.data)
						.map(v => <Character key={v.id} character={v} />)
					}
					{Object.values(charactersNew.v)
						.map(v => <Character key={v.id} character={v}
							deleteNew={() => charactersNew.set(V =>
							{
								delete V[v.id];
								return { ...V };
							})}
						/>)
					}
				</div>
			</>}
		</Popup >
	</>;
}
