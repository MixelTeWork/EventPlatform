import { useEffect } from "react";
import { useMutationTourneyEditNode, useMutationTourneyEditThird, useMutationTourneyStartGameAtNode, useTourneyCharacters, useTourneyData, type TourneyCharacter, type TreeNode } from "../../../api/tourney";
import Spinner from "../../../components/Spinner";
import classNames from "../../../utils/classNames";
import displayError from "../../../utils/displayError";
import useStateBool from "../../../utils/useStateBool";
import useStateObj from "../../../utils/useStateObj";
import styles from "./styles.module.css"
import IconCancel from "../../../icons/cancel";
import IconSave from "../../../icons/save";
import IconPlay from "../../../icons/play";
import PopupConfirm from "../../../components/PopupConfirm";

export default function TourneyEdit()
{
	const tourney = useTourneyData()
	const characters = useTourneyCharacters();

	const curGame = findNode(tourney.data?.tree, tourney.data?.curGameNodeId || 0, tourney.data?.third || -1);
	const curGameCharacterLeft = characters.data?.find(ch => ch.id == curGame?.left?.characterId);
	const curGameCharacterRight = characters.data?.find(ch => ch.id == curGame?.right?.characterId);

	return (
		<div className={styles.root}>
			{tourney.isLoading && <Spinner />}
			{characters.isLoading && <Spinner />}
			{displayError(tourney)}
			{displayError(characters)}
			{tourney.data && characters.data && <>
				<span>
					<span>Текущая игра: </span>
					{!curGame ? <span>не запущено</span> : <span className={styles.curGameState}>
						<span className={styles.characterName}>{curGameCharacterLeft?.name ?? "N/A"}</span>
						<span> vs </span>
						<span className={styles.characterName}>{curGameCharacterRight?.name ?? "N/A"}</span>
						<CancelGameBtn />
					</span>}
				</span>
				<span style={{ marginTop: "0.5rem" }}>Турнирная таблица:</span>
				<Tree tree={tourney.data.tree} characters={characters.data} />
				<span style={{ marginTop: "0.5rem" }}>Третье место:</span>
				<ThirdPlace tree={tourney.data.tree} third={tourney.data.third} characters={characters.data} />
			</>}
		</div>
	);
}

function CancelGameBtn()
{
	const canceling = useStateBool(false);

	return <>
		<button className={styles.btn} onClick={canceling.setT}><IconCancel /></button>
		<PopupConfirm
			title={"Сбросить текущую игру"}
			itemId={-1} mutationFn={useMutationTourneyStartGameAtNode}
			open={canceling.v} close={canceling.setF}
		/>
	</>
}


function Tree({ tree, characters, c = false }: { tree: TreeNode, characters: TourneyCharacter[], c?: boolean })
{
	const collapsed = useStateBool(true);
	const starting = useStateBool(false);
	const characterId = useStateObj(tree.characterId);
	const character = characters.find(ch => ch.id == characterId.v);
	const editNode = useMutationTourneyEditNode(tree.id);

	const characterLeft = characters.find(ch => ch.id == tree.left?.characterId);
	const characterRight = characters.find(ch => ch.id == tree.right?.characterId);

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
				{characterLeft && characterRight && <button onClick={starting.setT}><IconPlay /></button>}
				<select value={characterId.v} onChange={e => characterId.set(parseInt(e.target.value, 10))}>
					<option value="-1">Нет победителя</option>
					{characters.map(ch => <option value={ch.id} key={ch.id}>{ch.name}</option>)}
				</select>
				{(tree.left || tree.right) && <button className={styles.collapseBtn} onClick={collapsed.toggle}></button>}
			</div>
			<PopupConfirm
				title={<><h3>Запустить игру</h3><h4>{characterLeft?.name ?? "N/A"} vs {characterRight?.name ?? "N/A"}</h4></>}
				itemId={tree.id} mutationFn={useMutationTourneyStartGameAtNode}
				open={starting.v} close={starting.setF}
			/>
			{tree.left && <Tree tree={tree.left} characters={characters} c={!c} />}
			{tree.right && <Tree tree={tree.right} characters={characters} c={c} />}
		</div>
	);
}

function findNode(tree: TreeNode | null | undefined, id: number, third: number): TreeNode | null
{
	if (!tree) return null;
	if (tree.id == id) return tree;
	if (id == -3)
	{
		const left = { id: -2, characterId: (!tree.left?.characterId || tree.left?.characterId == -1 ? null : tree.left.left?.characterId == tree.left?.characterId ? tree.left.right?.characterId : tree.left.left?.characterId) || -1, left: null, right: null };
		const right = { id: -2, characterId: (!tree.right?.characterId || tree.right?.characterId == -1 ? null : tree.right.left?.characterId == tree.right?.characterId ? tree.right.right?.characterId : tree.right.left?.characterId) || -1, left: null, right: null };
		return { id: -3, characterId: third, left, right, };
	}
	return findNode(tree.left, id, third) || findNode(tree.right, id, third);
}

function ThirdPlace({ tree, third, characters }: { tree: TreeNode, third: number, characters: TourneyCharacter[] })
{
	const starting = useStateBool(false);
	const characterId = useStateObj(third);
	const character = characters.find(ch => ch.id == characterId.v);
	const editNode = useMutationTourneyEditThird();

	const characterLeftId = !tree.left?.characterId || tree.left?.characterId == -1 ? null : tree.left.left?.characterId == tree.left?.characterId ? tree.left.right?.characterId : tree.left.left?.characterId;
	const characterRightId = !tree.right?.characterId || tree.right?.characterId == -1 ? null : tree.right.left?.characterId == tree.right?.characterId ? tree.right.right?.characterId : tree.right.left?.characterId;
	const characterLeft = characters.find(ch => ch.id == characterLeftId);
	const characterRight = characters.find(ch => ch.id == characterRightId);

	// eslint-disable-next-line
	useEffect(() => { characterId.set(third) }, [third]);

	return (
		<div className={styles.third}>
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
					{characterLeft && characterRight && <button onClick={starting.setT}><IconPlay /></button>}
					<select value={characterId.v} onChange={e => characterId.set(parseInt(e.target.value, 10))}>
						<option value="-1">Нет победителя</option>
						{characters.map(ch => <option value={ch.id} key={ch.id}>{ch.name}</option>)}
					</select>
				</div>
				<PopupConfirm
					title={<><h3>Запустить игру</h3><h4>{characterLeft?.name ?? "N/A"} vs {characterRight?.name ?? "N/A"}</h4></>}
					itemId={-3} mutationFn={useMutationTourneyStartGameAtNode}
					open={starting.v} close={starting.setF}
				/>
			</div>
			<div className={styles.node}>
				<div className={styles.nodeData}>
					{characterLeft ? <>
						<img src={characterLeft?.img} alt={characterLeft?.name} />
						<div>{characterLeft?.name}</div>
					</> : <>
						<div className={styles.img}></div>
						<div>Нет проигравшего</div>
					</>}
				</div>
			</div>
			<div className={styles.node}>
				<div className={styles.nodeData}>
					{characterRight ? <>
						<img src={characterRight?.img} alt={characterRight?.name} />
						<div>{characterRight?.name}</div>
					</> : <>
						<div className={styles.img}></div>
						<div>Нет проигравшего</div>
					</>}
				</div>
			</div>
		</div>
	);
}