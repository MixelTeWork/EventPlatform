import { useEffect } from "react";
import { useMutationTourneyEditNode, useMutationTourneyEditThird, useMutationTourneyStartGameAtNode, useTourneyCharacters, useTourneyData, type TourneyCharacter, type TourneyData, type TreeNode } from "../../../api/tourney";
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
import IconEdit from "../../../icons/edit";
import { type UseQueryResult } from "react-query";
import { characterById } from "../../../api/tourney";

export default function TourneyEdit()
{
	const tourney = useTourneyData();
	const characters = useTourneyCharacters();

	const curGame = findNode(tourney.data?.tree, tourney.data?.curGameNodeId || 0, tourney.data?.third || -1);
	const curGameWinner = characterById(characters.data, curGame?.characterId);
	const curGameCharacterLeft = characterById(characters.data, curGame?.left?.characterId);
	const curGameCharacterRight = characterById(characters.data, curGame?.right?.characterId);

	const errors = tourney.data?.tree && characters.data && checkTreeForErrors(tourney.data.tree, characters.data);

	return (
		<div className={styles.root}>
			{characters.isLoading && <Spinner />}
			{displayError(characters)}
			{tourney.data && characters.data && <>
				<div className={styles.curGameState}>
					<span>Текущая игра: </span>
					{!curGame ? <span>не запущено</span> : <span>
						<span className={styles.characterName}>{curGameCharacterLeft?.name ?? "N/A"}</span>
						<span> vs </span>
						<span className={styles.characterName}>{curGameCharacterRight?.name ?? "N/A"}</span>
						<CancelGameBtn />
					</span>}
					<span>
						<span>Победитель: </span>
						<EditWinnerBtn tourney={tourney} winner={curGameWinner} oponent1={curGameCharacterLeft} oponent2={curGameCharacterRight} />
					</span>
				</div>
				<div style={{ marginTop: "0.5rem" }}>Турнирная таблица:</div>
				{errors && errors.map(e => <h3 style={{ color: "tomato" }}>{e}</h3>)}
				<Tree tree={tourney.data.tree} characters={characters.data} />
				<div style={{ marginTop: "0.5rem" }}>Третье место:</div>
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

function EditWinnerBtn({ tourney, winner, oponent1, oponent2 }: { tourney: UseQueryResult<TourneyData>, winner: TourneyCharacter | undefined, oponent1: TourneyCharacter | undefined, oponent2: TourneyCharacter | undefined })
{
	const winnerId = useStateObj(winner?.id || -1);
	const editing = useStateBool(false);
	const editNode = useMutationTourneyEditNode(tourney.data?.curGameNodeId || -1);

	// eslint-disable-next-line
	useEffect(() => { winnerId.set(winner?.id || -1) }, [winner?.id]);

	const winnerName =
		winnerId.v == winner?.id ? winner.name :
			winnerId.v == oponent1?.id ? oponent1.name :
				winnerId.v == oponent2?.id ? oponent2.name : "отсутствует";

	return <>
		{editNode.isLoading && <Spinner />}
		{displayError(editNode)}
		{!editing.v ? <>
			<span className={styles.characterName}>{winnerName}</span>
			{oponent1 && oponent2 &&
				<button className={styles.btn} onClick={() =>
				{
					tourney.refetch()
					editing.setT();
				}}><IconEdit /></button>
			}
		</> : <>
			{tourney.isFetching && <Spinner />}
			<select className={styles.winnerSelect} value={winnerId.v} onChange={e => winnerId.set(parseInt(e.target.value, 10))}>
				<option value="-1">отсутствует</option>
				<option value={oponent1?.id || "-1"}>{oponent1?.name ?? "N/A"}</option>
				<option value={oponent2?.id || "-1"}>{oponent2?.name ?? "N/A"}</option>
			</select>
			<button className={styles.btn} onClick={() =>
			{
				editNode.mutate({ characterId: winnerId.v });
				editing.setF();
			}}>
				<IconSave />
			</button>
			<button className={styles.btn} onClick={editing.setF}><IconCancel /></button>
		</>}
	</>
}


function Tree({ tree, characters, c = false }: { tree: TreeNode, characters: TourneyCharacter[], c?: boolean })
{
	const collapsed = useStateBool(true);
	const starting = useStateBool(false);
	const characterId = useStateObj(tree.characterId);
	const character = characters.find(ch => ch.id == characterId.v);
	const editNode = useMutationTourneyEditNode(tree.id);

	const characterLeft = characterById(characters, tree.left?.characterId);
	const characterRight = characterById(characters, tree.right?.characterId);

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
				title={<><h3>Выбрать для запуска</h3><h4>{characterLeft?.name ?? "N/A"} vs {characterRight?.name ?? "N/A"}</h4></>}
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
	const character = characterById(characters, characterId.v);
	const editNode = useMutationTourneyEditThird();

	const characterLeftId = !tree.left?.characterId || tree.left?.characterId == -1 ? null : tree.left.left?.characterId == tree.left?.characterId ? tree.left.right?.characterId : tree.left.left?.characterId;
	const characterRightId = !tree.right?.characterId || tree.right?.characterId == -1 ? null : tree.right.left?.characterId == tree.right?.characterId ? tree.right.right?.characterId : tree.right.left?.characterId;
	const characterLeft = characterById(characters, characterLeftId);
	const characterRight = characterById(characters, characterRightId);

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

function checkTreeForErrors(tree: TreeNode, characters: TourneyCharacter[])
{
	let parents = [tree];
	let children = [] as TreeNode[];
	let errors = [];
	while (parents.length != 0)
	{
		for (const node of parents)
		{
			if (node.characterId == -1) continue;
			const same = parents.filter(n => n.characterId == node.characterId);
			if (same.length > 1)
				errors.push(`Ноды с id=[${same.map(n => n.id).join(", ")}] имеют одинакового противника: ${characterById(characters, node.characterId)?.name}`);
		}
		for (const p of parents)
		{
			if (p.left) children.push(p.left);
			if (p.right) children.push(p.right);
			if (p.characterId != -1 && (p.left || p.right))
			{
				if (p.characterId != p.left?.characterId && p.characterId != p.right?.characterId)
					errors.push(`Победитель ноды id=${p.id} не совпадает с противниками: ${characterById(characters, p.characterId)?.name} != [${characterById(characters, p.left?.characterId)?.name}, ${characterById(characters, p.right?.characterId)?.name}]`);
			}
		}
		parents = children;
		children = [];
	}
	return Array.from(new Set(errors));
}
