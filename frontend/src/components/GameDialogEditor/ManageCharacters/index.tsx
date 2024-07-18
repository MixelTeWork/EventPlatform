import useStateBool from "../../../utils/useStateBool";
import Popup from "../../Popup";
import styles from "./styles.module.css"

export default function ManageCharacters()
{
	const popupOpen = useStateBool(false);

	return <>
		<button className={styles.root} onClick={popupOpen.setT}>Управление персонажами</button>
		<Popup title="Управление персонажами" open={popupOpen.v} close={popupOpen.setF}></Popup>
	</>;
}
