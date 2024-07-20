import { createEmptyCharacter, useDialogCharacters, type GameDialogCharacter } from "../../../api/dialog";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import Popup from "../../Popup";
import Spinner from "../../Spinner";
import Character from "./Character";
import styles from "./styles.module.css"

export default function ManageCharacters()
{
	const popupOpen = useStateBool(false);
	const characters = useDialogCharacters();
	const charactersNew = useStateObj<{ [id: number]: GameDialogCharacter; }>({});
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
					{Object.keys(characters.data)
						.map(key => characters.data[key as any])
						.map(v => <Character key={v.id} character={v} />)
					}
					{Object.keys(charactersNew.v)
						.map(key => charactersNew.v[key as any])
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
