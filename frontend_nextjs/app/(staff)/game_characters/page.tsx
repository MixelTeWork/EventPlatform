"use client"
import styles from "./page.module.css"
import AddCharacter from "./AddCharacter";
import Character from "./Character";
import { useTitle } from "@/utils/useTtile";
import useSecuredPage from "@/utils/useSecuredPage";
import { useTourneyCharacters } from "@/api/tourney";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";

export default function Page()
{
	useTitle("Турнир | Персонажи");
	useSecuredPage("manage_games");
	const characters = useTourneyCharacters();

	return <>
		{characters.isLoading && <Spinner />}
		{displayError(characters)}

		<h1>Управление персонажами турнира</h1>

		<AddCharacter />

		<div className={styles.characters}>
			{characters.data?.map(character => <Character key={character.id} character={character} />)}
		</div>
	</>;
}
