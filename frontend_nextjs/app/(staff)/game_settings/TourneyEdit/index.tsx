import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import useStateBool from "@/utils/useStateBool";
import useStateObj from "@/utils/useStateObj";
import styles from "./styles.module.css"
import IconCancel from "@icons/cancel";
import IconSave from "@icons/save";
import IconPlay from "@icons/play";
import IconEdit from "@icons/edit";
import { characterById, findTourneyTreeNode, useMutationTourneyEditNode, useMutationTourneyEditThird, useMutationTourneyStartGameAtNode, useTourneyCharacters, useTourneyData, type TourneyCharacter, type TourneyData, type TourneyNodeData, type TreeNode } from "@/api/tourney";
import PopupConfirm from "@sCmps/PopupConfirm";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import clsx from "@/utils/clsx";
import Button from "@sCmps/Button";
import Select from "@sCmps/Select";

export default function TourneyEdit()
{
	const tourney = useTourneyData();
	const characters = useTourneyCharacters();

	const curGame = findTourneyTreeNode(tourney.data?.tree, tourney.data?.curGameNodeId || 0, tourney.data?.third || -1);
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
						<CharacterIcon character={curGameCharacterLeft} />
						<span> vs </span>
						<CharacterIcon character={curGameCharacterRight} />
						<CancelGameBtn />
					</span>}
					<span>
						<span>Победитель: </span>
						<EditWinnerBtn tourney={tourney} winner={curGameWinner} oponent1={curGameCharacterLeft} oponent2={curGameCharacterRight} />
					</span>
				</div>
				<div style={{ marginTop: "0.5rem" }}>Турнирная таблица:</div>
				{errors && errors.map(e => <h3 key={e} style={{ color: "tomato" }}>{e}</h3>)}
				<Tree tree={tourney.data.tree} characters={characters.data} />
				<div style={{ marginTop: "0.5rem" }}>Третье место:</div>
				<ThirdPlace tree={tourney.data.tree} third={tourney.data.third} characters={characters.data} />
			</>}
		</div>
	);
}

function CharacterIcon({ character, textNA = "N/A" }: { character: TourneyCharacter | undefined | null, textNA?: string })
{
	return (
		<span className={styles.characterName}>
			{character ? <img src={character.img} alt={character.name} /> : <div></div>}
			<span>{character?.name ?? textNA}</span>
		</span>
	);
}

function CancelGameBtn()
{
	const canceling = useStateBool(false);

	return <>
		<Button text={<IconCancel />} onClick={canceling.setT} size="1.4rem" />
		<PopupConfirm
			title={"Сбросить текущую игру"}
			itemId={-1} mutationFn={useMutationTourneyStartGameAtNode}
			openState={canceling}
		/>
	</>
}

function EditWinnerBtn({ tourney, winner, oponent1, oponent2 }: {
	tourney: UseQueryResult<TourneyData>,
	winner: TourneyCharacter | undefined,
	oponent1: TourneyCharacter | undefined,
	oponent2: TourneyCharacter | undefined,
})
{
	const winnerId = useStateObj(winner?.id || -1);
	const editing = useStateBool(false);
	const editNode = useMutationTourneyEditNode(tourney.data?.curGameNodeId || -1);

	useEffect(() => { winnerId.set(winner?.id || -1) }, [winner?.id]);

	const winnerCur =
		winnerId.v == winner?.id ? winner :
			winnerId.v == oponent1?.id ? oponent1 :
				winnerId.v == oponent2?.id ? oponent2 : null;

	return <>
		{editNode.isPending && <Spinner />}
		{displayError(editNode)}
		{!editing.v ? <>
			<CharacterIcon character={winnerCur} textNA="отсутствует" />
			{oponent1 && oponent2 &&
				<Button text={<IconEdit />} size="1.4rem" onClick={() =>
				{
					tourney.refetch()
					editing.setT();
				}} />
			}
		</> : <>
			{tourney.isFetching && <Spinner />}
			<Select values={{
				"-1": "отсутствует",
				[oponent1?.id || "-1"]: oponent1?.name ?? "N/A",
				[oponent2?.id || "-1"]: oponent2?.name ?? "N/A",
			}} item={it => it} stateObj={winnerId} />
			<Button text={<IconSave />} size="1.4rem" onClick={() =>
			{
				editNode.mutate({ characterId: winnerId.v });
				editing.setF();
			}} />
			<Button text={<IconCancel />} size="1.4rem" onClick={editing.setF} />
		</>}
	</>
}


function Tree({ tree, characters, c = false }: {
	tree: TreeNode,
	characters: TourneyCharacter[],
	c?: boolean
})
{
	const collapsed = useStateBool(true);
	const starting = useStateBool(false);
	const editNode = useMutationTourneyEditNode(tree.id);

	const characterLeft = characterById(characters, tree.left?.characterId);
	const characterRight = characterById(characters, tree.right?.characterId);


	return (
		<div className={clsx(styles.node, c && styles.nodeC, collapsed.v && styles.nodeCollapsed)}>
			<div className={styles.nodeId}>{tree.id}</div>
			<TreeNodeData
				characters={characters}
				characterIdTree={tree.characterId}
				editNode={editNode}
				collapse={(tree.left || tree.right) && collapsed.toggle}
				start={characterLeft && characterRight && starting.setT}
			/>
			<PopupConfirm
				title={<><h3>Запустить игру</h3><h4>{characterLeft?.name ?? "N/A"} vs {characterRight?.name ?? "N/A"}</h4></>}
				itemId={tree.id} mutationFn={useMutationTourneyStartGameAtNode}
				openState={starting}
			/>
			{tree.left && <Tree tree={tree.left} characters={characters} c={!c} />}
			{tree.right && <Tree tree={tree.right} characters={characters} c={c} />}
		</div>
	);
}

function TreeNodeData({ characters, characterIdTree, editNode, collapse, start }: {
	characters: TourneyCharacter[],
	characterIdTree: number,
	editNode: UseMutationResult<TourneyData, any, TourneyNodeData, unknown>
	collapse?: (() => void) | null,
	start?: (() => void) | null,
})
{
	const characterId = useStateObj(characterIdTree);
	const character = characters.find(ch => ch.id == characterId.v);

	useEffect(() => { characterId.set(characterIdTree) }, [characterIdTree]);
	return (
		<div className={styles.nodeData} onClick={collapse ?? undefined}>
			{character ? <>
				<img src={character.img} alt={character.name} />
				<div>{character.name}</div>
			</> : <>
				<div className={styles.nodeData__img}></div>
				<div>Нет победителя</div>
			</>}
			<div style={{ flexGrow: 1 }}></div>
			{editNode.isPending && <Spinner block />}
			{displayError(editNode)}
			{characterId.v != characterIdTree && <span className={styles.ctrlBtns} onClick={e => e.stopPropagation()}>
				<Button text={<IconSave />} size="1.4rem" onClick={() => editNode.mutate({ characterId: characterId.v })} />
				<Button text={<IconCancel />} size="1.4rem" onClick={() => { characterId.set(characterIdTree); editNode.reset(); }} />
			</span>}
			{start && <Button text={<IconPlay />} size="1.4rem" onClick={e => { e.stopPropagation(); start(); }} />}
			<Select
				values={[{ id: -1, name: "Нет победителя" }, ...characters]}
				item={it => ({ id: it.id, text: it.name })}
				stateObj={characterId}
				onClick={e => e.stopPropagation()}
			/>
			{collapse && <Button size="1.4rem" className={styles.collapseBtn} />}
		</div>
	);
}

function ThirdPlace({ tree, third, characters }: { tree: TreeNode, third: number, characters: TourneyCharacter[] })
{
	const starting = useStateBool(false);
	const editNode = useMutationTourneyEditThird();

	const characterLeftId = !tree.left?.characterId || tree.left?.characterId == -1 ? null : tree.left.left?.characterId == tree.left?.characterId ? tree.left.right?.characterId : tree.left.left?.characterId;
	const characterRightId = !tree.right?.characterId || tree.right?.characterId == -1 ? null : tree.right.left?.characterId == tree.right?.characterId ? tree.right.right?.characterId : tree.right.left?.characterId;
	const characterLeft = characterById(characters, characterLeftId);
	const characterRight = characterById(characters, characterRightId);

	return (
		<div className={styles.third}>
			<div className={styles.node}>
				<TreeNodeData
					characters={characters}
					characterIdTree={third}
					editNode={editNode}
					start={characterLeft && characterRight && starting.setT}
				/>
				<PopupConfirm
					title={<><h3>Запустить игру</h3><h4>{characterLeft?.name ?? "N/A"} vs {characterRight?.name ?? "N/A"}</h4></>}
					itemId={-3} mutationFn={useMutationTourneyStartGameAtNode}
					open={starting.v} close={starting.setF}
				/>
			</div>
			<ThirdPlaceMiniNode character={characterLeft} />
			<ThirdPlaceMiniNode character={characterRight} />
		</div>
	);
}

function ThirdPlaceMiniNode({ character }: { character: TourneyCharacter | undefined })
{
	return (
		<div className={styles.node}>
			<div className={styles.nodeData}>
				{character ? <>
					<img src={character.img} alt={character.name} />
					<div>{character.name}</div>
				</> : <>
					<div className={styles.nodeData__img}></div>
					<div>Нет проигравшего</div>
				</>}
			</div>
		</div>
	)
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
