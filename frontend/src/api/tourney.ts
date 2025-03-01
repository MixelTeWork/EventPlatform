import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchDelete, fetchJsonGet, fetchJsonPost } from "../utils/fetch";
import type { ImgData } from "./dataTypes";
import { queryListAddItem, queryListDeleteItem, queryListUpdateItem } from "../utils/query";


export interface TourneyData
{
	tree: TreeNode,
	third: number,
}

export interface TreeNode
{
	id: number,
	characterId: number,
	left: TreeNode | null,
	right: TreeNode | null,
}

export function useTourneyCharacters()
{
	return useQuery("tourneyCharacters", async () =>
		await fetchJsonGet<TourneyCharacter[]>(`/api/tourney/characters`)
	);
}

export function useTourneyData()
{
	return useQuery("tourney", async () =>
		await fetchJsonGet<TourneyData>(`/api/tourney`)
	);
}

export interface TourneyCharacter
{
	id: number,
	name: string,
	img: string,
}

export function useMutationAddTourneyCharacter(onSuccess?: (data: TourneyCharacter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (characterData: TourneyCharacterData) =>
			await fetchJsonPost<TourneyCharacter>("/api/tourney/characters", characterData),
		onSuccess: (data: TourneyCharacter) =>
		{
			queryListAddItem(queryClient, "tourneyCharacters", data);
			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export interface TourneyCharacterData
{
	name: string,
	img?: ImgData,
}

export function useMutationEditTourneyCharacter(characterId: number, onSuccess?: (data: TourneyCharacter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (characterData: TourneyCharacterData) =>
			await fetchJsonPost<TourneyCharacter>(`/api/tourney/characters/${characterId}`, characterData),
		onSuccess: (data: TourneyCharacter) =>
		{
			queryListUpdateItem(queryClient, "tourneyCharacters", data);
			onSuccess?.(data);
		},
		onError: onError,
	});
	return mutation;
}

export function useMutationDeleteTourneyCharacter(characterId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchDelete(`/api/tourney/characters/${characterId}`),
		onSuccess: () =>
		{
			queryListDeleteItem(queryClient, "tourneyCharacters", characterId);
			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}


export function useMutationEditTourneyNode(nodeId: number, onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (nodeData: TourneyNodeData) =>
			await fetchJsonPost<TourneyData>(`/api/tourney/nodes/${nodeId}`, nodeData),
		onSuccess: (data: TourneyData) =>
		{
			queryClient.setQueryData("tourney", data);
			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}

export interface TourneyNodeData
{
	characterId: number,
}


export function useMutationEditTourneyThird(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (nodeData: TourneyNodeData) =>
			await fetchJsonPost<TourneyData>(`/api/tourney/third`, nodeData),
		onSuccess: (data: TourneyData) =>
		{
			queryClient.setQueryData("tourney", data);
			onSuccess?.();
		},
		onError: onError,
	});
	return mutation;
}
