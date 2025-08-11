import { type QueryClient } from "@tanstack/react-query";
import { queryListAddItem, queryListDeleteItem, queryListUpdateItem, stdQuery } from "@/utils/query";
import { itemDeleteMutation, itemMutation, stdMutation } from "@/utils/mutations";
import type { ImgData } from "./dataTypes";


export interface TourneyData
{
	tree: TreeNode,
	third: number,
	curGameNodeId: number,
	showGame: boolean,
	ended: boolean,
}

export interface TreeNode
{
	id: number,
	characterId: number,
	left: TreeNode | null,
	right: TreeNode | null,
}

export interface TourneyCharacter
{
	id: number,
	name: string,
	color: string,
	img: string,
}

const url = "/api/tourney"
const urlCharacters = "/api/tourney/characters"
const queryKey = () => ["tourney"];
const queryKeyCharacters = () => ["tourneyCharacters"];

export const useTourneyData = stdQuery<TourneyData>(queryKey(), url);

export const useTourneyCharacters = stdQuery<TourneyCharacter[]>(queryKeyCharacters(), urlCharacters);
export const characterById = (characters: TourneyCharacter[] | undefined | null, id: number | undefined | null) =>
	characters?.find(ch => ch.id == id);

export interface TourneyCharacterData
{
	name: string,
	color: string,
	img?: ImgData,
}
export const useMutationTourneyCharacterAdd = stdMutation<TourneyCharacterData, TourneyCharacter>(urlCharacters, (qc, data) =>
{
	queryListAddItem(qc, queryKeyCharacters(), data);
});

export const useMutationTourneyCharacterEdit = itemMutation<TourneyCharacterData, TourneyCharacter>(urlCharacters, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyCharacters(), data);
});

export const useMutationTourneyCharacterDelete = itemDeleteMutation(urlCharacters, (qc, id) =>
{
	queryListDeleteItem(qc, queryKeyCharacters(), id);
});


export interface TourneyNodeData { characterId: number }
export const useMutationTourneyEditNode = itemMutation<TourneyNodeData, TourneyData>(`${url}/nodes`, updateData);
export const useMutationTourneyEditThird = stdMutation<TourneyNodeData, TourneyData>(`${url}/third`, updateData);
export const useMutationTourneyStartGameAtNode = itemMutation<void, TourneyData>(() => `${url}/start_game_at_node`, updateData, (_, nodeId) => ({ nodeId }));
export const useMutationTourneySelectNextGame = actionMutation("select_next_game");
export const useMutationTourneyStartGame = actionMutation("start_game");
export const useMutationTourneyEndGame = actionMutation("end_game");
export const useMutationTourneyShowPretourney = actionMutation("show_pretourney");
export const useMutationTourneyEndTourney = actionMutation("end_tourney");
export const useMutationTourneyUnendTourney = actionMutation("unend_tourney");
export const useMutationTourneyReset = actionMutation("reset");

function actionMutation(action: string)
{
	return stdMutation<void, TourneyData>(`${url}/${action}`, updateData);
}

function updateData(qc: QueryClient, data: TourneyData)
{
	qc.setQueryData(queryKey(), data);
}

export function findTourneyTreeNode(tree: TreeNode | null | undefined, id: number, third: number): TreeNode | null
{
	if (!tree) return null;
	if (tree.id == id) return tree;
	if (id == -3)
	{
		const left = { id: -2, characterId: (!tree.left?.characterId || tree.left?.characterId == -1 ? null : tree.left.left?.characterId == tree.left?.characterId ? tree.left.right?.characterId : tree.left.left?.characterId) || -1, left: null, right: null };
		const right = { id: -2, characterId: (!tree.right?.characterId || tree.right?.characterId == -1 ? null : tree.right.left?.characterId == tree.right?.characterId ? tree.right.right?.characterId : tree.right.left?.characterId) || -1, left: null, right: null };
		return { id: -3, characterId: third, left, right, };
	}
	return findTourneyTreeNode(tree.left, id, third) || findTourneyTreeNode(tree.right, id, third);
}
