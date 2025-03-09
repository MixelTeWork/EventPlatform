import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchJsonGet, fetchJsonPost } from "../utils/fetch";
import type { UserGroup } from "./user";

export type State = "wait" | "start" | "going" | "end";

export interface GameState
{
	state: State,
	opponent1Id: number | null,
	opponent2Id: number | null,
	winner: UserGroup,
	counter: number,
	start: string,
	showGame: boolean,
	team: number,
}
export interface GameStateFull extends GameState
{
	clicks1: number,
	clicks2: number,
}
export interface GameDuration
{
	duration: number,
}
export interface GameCounter
{
	counter: number,
}
export interface GameStartStr
{
	startStr: string,
}

export function useGameState()
{
	return useQuery("gameState", async () =>
		await fetchJsonGet<GameState>("/api/game/state")
	);
}

export function useGameStateFull()
{
	return useQuery("gameStateFull", async () =>
		await fetchJsonGet<GameStateFull>("/api/game/state_full")
	);
}

export function useMutationSendClick(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (count: number) =>
			await fetchJsonPost<GameState>("/api/game/click", { count }),
		onSuccess: (state: GameState) =>
		{
			queryClient.setQueryData("gameState", state);
			onSuccess?.();
		},
		onError,
	});
	return mutation;
}


export function useGameDuration()
{
	return useQuery("gameDuration", async () =>
		await fetchJsonGet<GameDuration>("/api/game/duration")
	);
}

export function useGameCounter()
{
	return useQuery("gameCounter", async () =>
		await fetchJsonGet<GameCounter>("/api/game/counter")
	);
}

export function useGameStartStr()
{
	return useQuery("gameStartStr", async () =>
		await fetchJsonGet<GameStartStr>("/api/game/startStr")
	);
}


export function useMutationGameDuration(onSuccess?: (data: GameDuration) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (duration: number) =>
			await fetchJsonPost<GameDuration>("/api/game/duration", { duration }),
		onSuccess: (data: GameDuration) =>
		{
			queryClient.setQueryData("gameDuration", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}

export function useMutationGameCounter(onSuccess?: (data: GameCounter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (counter: number) =>
			await fetchJsonPost<GameCounter>("/api/game/counter", { counter }),
		onSuccess: (data: GameCounter) =>
		{
			queryClient.setQueryData("gameCounter", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}

export function useMutationGameStartStr(onSuccess?: (data: GameStartStr) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (startStr: string) =>
			await fetchJsonPost<GameStartStr>("/api/game/startStr", { startStr }),
		onSuccess: (data: GameStartStr) =>
		{
			queryClient.setQueryData("gameStartStr", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}

export function useMutationGameSelectTeam(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (team: number) =>
			await fetchJsonPost<GameState>("/api/game/select_team", { team }),
		onSuccess: (data: GameState) =>
		{
			queryClient.setQueryData("gameState", data);
			onSuccess?.();
		},
		onError,
	});
	return mutation;
}
