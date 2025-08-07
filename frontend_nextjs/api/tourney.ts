import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { fetchJsonPost } from "@/utils/fetch";
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
export const useMutationAddTourneyCharacter = stdMutation<TourneyCharacterData, TourneyCharacter>(urlCharacters, (qc, data) =>
{
	queryListAddItem(qc, queryKeyCharacters(), data);
});

export const useMutationEditTourneyCharacter = itemMutation<TourneyCharacterData, TourneyCharacter>(urlCharacters, (qc, data) =>
{
	queryListUpdateItem(qc, queryKeyCharacters(), data);
});

export const useMutationDeleteTourneyCharacter = itemDeleteMutation(urlCharacters, (qc, id) =>
{
	queryListDeleteItem(qc, queryKeyCharacters(), id);
});


export interface TourneyNodeData { characterId: number }
export const useMutationTourneyEditNode = itemMutation<TourneyNodeData, TourneyData>(`${url}/nodes`, updateData);
export const useMutationTourneyEditThird = stdMutation<TourneyNodeData, TourneyData>(`${url}/third`, updateData);
export const useMutationTourneyStartGameAtNode = itemMutation<void, TourneyData>(`${url}/start_game_at_node`, updateData, (_, nodeId) => ({ nodeId }));
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
