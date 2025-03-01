import { useEffect } from "react";
import { useMutationEditTourneyNode, useMutationEditTourneyThird, useTourneyCharacters, useTourneyData, type TourneyCharacter, type TreeNode } from "../../../api/tourney";
import Spinner from "../../../components/Spinner";
import classNames from "../../../utils/classNames";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import IconCancel from "../../../icons/cancel";
import IconSave from "../../../icons/save";

export default function TourneyEdit()
{
	const tourney = useTourneyData()
	const characters = useTourneyCharacters();

	return (
		<div className={styles.root}>
			{tourney.isLoading && <Spinner />}
			{characters.isLoading && <Spinner />}
			{displayError(tourney)}
			{displayError(characters)}
			{tourney.data && characters.data && <>
				<span>Турнирная таблица:</span>
				<Tree tree={tourney.data.tree} characters={characters.data} />
				<span>Третье место:</span>
				<ThirdPlace third={tourney.data.third} characters={characters.data} />
			</>}
		</div>
	);
}


function Tree({ tree, characters, c = false }: { tree: TreeNode, characters: TourneyCharacter[], c?: boolean })
{
	const collapsed = useStateBool(true);
	const characterId = useStateObj(tree.characterId);
	const character = characters.find(ch => ch.id == characterId.v);
	const editNode = useMutationEditTourneyNode(tree.id);

	// eslint-disable-next-line
	useEffect(() => { characterId.set(tree.characterId) }, [tree.characterId]);

	return (
		<div className={classNames(styles.node, c && styles.nodeC, collapsed.v && styles.nodeCollapsed)}>
			<div className={styles.nodeId}>{tree.id}</div>
			<div className={styles.nodeData}>
				{character ? <>
					<img src={character?.img} alt={character?.name} />
					<div>{character?.name}</div>
				</> : <>
					<div className={styles.img}></div>
					<div>Нет победителя</div>
				</>}
				<div style={{ flexGrow: 1 }}></div>
				{editNode.isLoading && <Spinner block />}
				{displayError(editNode)}
				{characterId.v != tree.characterId && <span className={styles.ctrlBtns}>
					<button onClick={() => editNode.mutate({ characterId: characterId.v })}><IconSave /></button>
					<button onClick={() => { characterId.set(tree.characterId); editNode.reset(); }}><IconCancel /></button>
				</span>}
				<select value={characterId.v} onChange={e => characterId.set(parseInt(e.target.value, 10))}>
					<option value="-1">Нет победителя</option>
					{characters.map(ch => <option value={ch.id} key={ch.id}>{ch.name}</option>)}
				</select>
				{(tree.left || tree.right) && <button className={styles.collapseBtn} onClick={collapsed.toggle}></button>}
			</div>
			{tree.left && <Tree tree={tree.left} characters={characters} c={!c} />}
			{tree.right && <Tree tree={tree.right} characters={characters} c={c} />}
		</div>
	);
}

function ThirdPlace({ third, characters }: { third: number, characters: TourneyCharacter[] })
{
	const characterId = useStateObj(third);
	const character = characters.find(ch => ch.id == characterId.v);
	const editNode = useMutationEditTourneyThird();

	// eslint-disable-next-line
	useEffect(() => { characterId.set(third) }, [third]);

	return (
		<div className={styles.node}>
			<div className={styles.nodeData}>
				{character ? <>
					<img src={character?.img} alt={character?.name} />
					<div>{character?.name}</div>
				</> : <>
					<div className={styles.img}></div>
					<div>Нет победителя</div>
				</>}
				<div style={{ flexGrow: 1 }}></div>
				{editNode.isLoading && <Spinner block />}
				{displayError(editNode)}
				{characterId.v != third && <span className={styles.ctrlBtns}>
					<button onClick={() => editNode.mutate({ characterId: characterId.v })}><IconSave /></button>
					<button onClick={() => { characterId.set(third); editNode.reset(); }}><IconCancel /></button>
				</span>}
				<select value={characterId.v} onChange={e => characterId.set(parseInt(e.target.value, 10))}>
					<option value="-1">Нет победителя</option>
					{characters.map(ch => <option value={ch.id} key={ch.id}>{ch.name}</option>)}
				</select>
			</div>
		</div>
	);
}