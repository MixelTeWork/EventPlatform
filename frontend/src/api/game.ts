import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchJsonGet, fetchJsonPost, fetchPost } from "../utils/fetch";
import type { User } from "./user";

export type State = "title" | "wait" | "join" | "play" | "nojoin" | "won" | "loss" | "end";
export type Team = "blue" | "yellow" | "green" | "red" | "";

export interface GameState
{
	state: State,
	team: Team,
	winner: Team,
	counter: number,
	price: number,
	start: string,
	balance: number,
	reward: number | null,
}
export interface GameDuration
{
	duration: number,
}
export interface GameCounter
{
	counter: number,
}
export interface GamePrice
{
	price: number,
}
export interface GameStartStr
{
	startStr: string,
}

export function useGameState()
{
	const queryClient = useQueryClient();
	return useQuery("gameState", async () =>
	{
		const r = await fetchJsonGet<GameState>("/api/game/state")
		queryClient.setQueryData<User>("user", user => ({ ...user!, balance: r.balance }));
		return r;
	});
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

export function useGamePrice()
{
	return useQuery("gamePrice", async () =>
		await fetchJsonGet<GamePrice>("/api/game/price")
	);
}

export function useGameStartStr()
{
	return useQuery("gameStartStr", async () =>
		await fetchJsonGet<GameStartStr>("/api/game/startStr")
	);
}


export function useMutationGameStart(onSuccess?: () => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchPost("/api/game/start"),
		onSuccess,
		onError,
	});
	return mutation;
}


export function useMutationGameReset(onSuccess?: () => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchPost("/api/game/reset"),
		onSuccess,
		onError,
	});
	return mutation;
}

export function useMutationGameFinish(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (team: Team) =>
			await fetchJsonPost<GameState>("/api/game/finish", { team }),
		onSuccess: (state: GameState) =>
		{
			queryClient.setQueryData("gameState", state);
			onSuccess?.();
		},
		onError,
	});
	return mutation;
}


export function useMutationGameJoin(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (team: Team) =>
			await fetchJsonPost<GameState>("/api/game/join", { team }),
		onSuccess: (state: GameState) =>
		{
			queryClient.setQueryData("gameState", state);
			queryClient.setQueryData<User>("user", user => ({ ...user!, balance: state.balance }));
			onSuccess?.();
		},
		onError,
	});
	return mutation;
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

export function useMutationGamePrice(onSuccess?: (data: GamePrice) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (price: number) =>
			await fetchJsonPost<GamePrice>("/api/game/price", { price }),
		onSuccess: (data: GamePrice) =>
		{
			queryClient.setQueryData("gamePrice", data);
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
