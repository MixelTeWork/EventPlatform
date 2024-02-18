import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchJsonGet, fetchJsonPost, fetchPost } from "../utils/fetch";
import type { User } from "./user";

export type State = "title" | "wait" | "join" | "play" | "nojoin" | "won" | "loss" | "end";
export type Team = "blue" | "yellow" | "green" | "red" | "";

export interface RaceState
{
	state: State,
	team: Team,
	winner: Team,
	counter: number,
	price: number,
	start: string,
	balance: number,
}
export interface RaceDuration
{
	duration: number,
}
export interface RaceCounter
{
	counter: number,
}
export interface RacePrice
{
	price: number,
}
export interface RaceStartStr
{
	startStr: string,
}

export function useRaceState()
{
	const queryClient = useQueryClient();
	return useQuery("raceState", async () =>
	{
		const r = await fetchJsonGet<RaceState>("/api/race/state")
		queryClient.setQueryData<User>("user", user => ({ ...user!, balance: r.balance }));
		return r;
	});
}

export function useRaceDuration()
{
	return useQuery("raceDuration", async () =>
		await fetchJsonGet<RaceDuration>("/api/race/duration")
	);
}

export function useRaceCounter()
{
	return useQuery("raceCounter", async () =>
		await fetchJsonGet<RaceCounter>("/api/race/counter")
	);
}

export function useRacePrice()
{
	return useQuery("racePrice", async () =>
		await fetchJsonGet<RacePrice>("/api/race/price")
	);
}

export function useRaceStartStr()
{
	return useQuery("raceStartStr", async () =>
		await fetchJsonGet<RaceStartStr>("/api/race/startStr")
	);
}


export function useMutationRaceStart(onSuccess?: () => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchPost("/api/race/start"),
		onSuccess,
		onError,
	});
	return mutation;
}


export function useMutationRaceReset(onSuccess?: () => void, onError?: (err: any) => void)
{
	const mutation = useMutation({
		mutationFn: async () =>
			await fetchPost("/api/race/reset"),
		onSuccess,
		onError,
	});
	return mutation;
}

export function useMutationRaceFinish(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (team: Team) =>
			await fetchJsonPost<RaceState>("/api/race/finish", { team }),
		onSuccess: (state: RaceState) =>
		{
			queryClient.setQueryData("raceState", state);
			onSuccess?.();
		},
		onError,
	});
	return mutation;
}


export function useMutationRaceJoin(onSuccess?: () => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (team: Team) =>
			await fetchJsonPost<RaceState>("/api/race/join", { team }),
		onSuccess: (state: RaceState) =>
		{
			queryClient.setQueryData("raceState", state);
			queryClient.setQueryData<User>("user", user => ({ ...user!, balance: state.balance }));
			onSuccess?.();
		},
		onError,
	});
	return mutation;
}


export function useMutationRaceDuration(onSuccess?: (data: RaceDuration) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (duration: number) =>
			await fetchJsonPost<RaceDuration>("/api/race/duration", { duration }),
		onSuccess: (data: RaceDuration) =>
		{
			queryClient.setQueryData("raceDuration", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}

export function useMutationRaceCounter(onSuccess?: (data: RaceCounter) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (counter: number) =>
			await fetchJsonPost<RaceCounter>("/api/race/counter", { counter }),
		onSuccess: (data: RaceCounter) =>
		{
			queryClient.setQueryData("raceCounter", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}

export function useMutationRacePrice(onSuccess?: (data: RacePrice) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (price: number) =>
			await fetchJsonPost<RacePrice>("/api/race/price", { price }),
		onSuccess: (data: RacePrice) =>
		{
			queryClient.setQueryData("racePrice", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}

export function useMutationRaceStartStr(onSuccess?: (data: RaceStartStr) => void, onError?: (err: any) => void)
{
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (startStr: string) =>
			await fetchJsonPost<RaceStartStr>("/api/race/startStr", { startStr }),
		onSuccess: (data: RaceStartStr) =>
		{
			queryClient.setQueryData("raceStartStr", data);
			onSuccess?.(data);
		},
		onError,
	});
	return mutation;
}
