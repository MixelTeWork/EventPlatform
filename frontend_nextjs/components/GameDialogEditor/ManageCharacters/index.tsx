import styles from "./styles.module.css"
import { createEmptyCharacter, useDialogCharacters, type GameDialogCharacter, type GameDialogCharacterData } from "@/api/dialog";
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import useStateObj from "@/utils/useStateObj";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import Character from "./Character";

export default function ManageCharacters()
{
	const popupOpen = useStateBool(false);
	const characters = useDialogCharacters();
	const charactersNew = useStateObj<GameDialogCharacterData>({});
	const lastId = useStateObj(1);

	return <>
		<button className={styles.root} onClick={popupOpen.setT}>Управление персонажами</button>
		<Popup title="Управление персонажами" open={popupOpen.v} close={popupOpen.setF}
			footer={
				<button className={styles.addBtn} onClick={() =>
				{
					charactersNew.set(v =>
					{
						const nv = { ...v };
						nv[-lastId.v] = createEmptyCharacter(-lastId.v);
						lastId.set(v => v + 1);
						return nv;
					})
				}}>Добавить</button>
			}
		>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
			{characters.isSuccess && <>
				<div className={styles.characters}>
					{Object.values<GameDialogCharacter>(characters.data)
						.map(v => <Character key={v.id} character={v} />)
					}
					{Object.values(charactersNew.v)
						.map(v => <Character key={v.id} character={v}
							deleteNew={() =>
								charactersNew.set(V =>
								{
									delete V[v.id];
									return { ...V };
								})
							}
						/>)
					}
				</div>
			</>}
		</Popup >
	</>;
}
