import { stdQuery } from "@/utils/query";
import { stdMutation } from "@/utils/mutations";
import type { UserGroup } from "./user";

export type State = "wait" | "start" | "going" | "end" | "tourneyEnd";

export interface GameState
{
	state: State,
	opponent1Id: number | null,
	opponent2Id: number | null,
	winner: UserGroup,
	counter: number,
	start: string,
	team: number,
	tourneyWinner1: number,
	tourneyWinner2: number,
	tourneyWinner3: number,
}
export interface GameStateFull extends GameState
{
	showGame: boolean,
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

const url = "/api/game"
const queryKey = () => ["gameState"];
const queryKeyFull = () => ["gameStateFull"];
const queryKeyDuration = () => ["gameDuration"];
const queryKeyCounter = () => ["gameCounter"];
const queryKeyStartStr = () => ["gameStartStr"];

export const useGameState = stdQuery<GameState>(queryKey(), `${url}/state`);
export const useGameStateFull = stdQuery<GameStateFull>(queryKeyFull(), `${url}/state_full`);

export const useMutationSendClick = stdMutation<number, GameState>(`${url}/click`,
	(qc, data) => qc.setQueryData(queryKey(), data),
	(count: number) => ({ count }),
);


export const useGameDuration = stdQuery<GameDuration>(queryKeyDuration(), `${url}/duration`);
export const useGameCounter = stdQuery<GameCounter>(queryKeyCounter(), `${url}/countdown`);
export const useGameStartStr = stdQuery<GameStartStr>(queryKeyStartStr(), `${url}/startStr`);


export const useMutationGameDuration = stdMutation<number, GameDuration>(`${url}/duration`,
	(qc, data) => qc.setQueryData(queryKeyDuration(), data),
	(duration: number) => ({ duration }),
);
export const useMutationGameCounter = stdMutation<number, GameCounter>(`${url}/countdown`,
	(qc, data) => qc.setQueryData(queryKeyCounter(), data),
	(counter: number) => ({ counter }),
);
export const useMutationGameStartStr = stdMutation<string, GameStartStr>(`${url}/startStr`,
	(qc, data) => qc.setQueryData(queryKeyStartStr(), data),
	(startStr: string) => ({ startStr }),
);

export const useMutationGameSelectTeam = stdMutation<number, GameState>(`${url}/select_team`,
	(qc, data) => qc.setQueryData(queryKey(), data),
	(team: number) => ({ team }),
);

