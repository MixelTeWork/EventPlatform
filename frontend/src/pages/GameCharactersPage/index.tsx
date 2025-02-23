import { useTourneyCharacters } from "../../api/tourney";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import displayError from "../../utils/displayError";
import { useTitle } from "../../utils/useTtile";
import AddCharacter from "./AddCharacter";
import Character from "./Character";
import styles from "./styles.module.css"

export default function GameCharactersPage()
{
	useTitle("Турнир | Персонажи");
	const characters = useTourneyCharacters();

	return (
		<Layout centeredPage gap="0.5rem" homeBtn>
			<div className="calmBack"></div>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}

			<h1>Управление персонажами турнира</h1>

			<AddCharacter />

			<div className={styles.characters}>
				{characters.data?.map(character => <Character key={character.id} character={character} />)}
			</div>
		</Layout>
	);
}
