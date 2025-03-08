import { useEffect } from "react";
import type { GameStateFull } from "../../api/game";
import { formatError } from "../../utils/displayError";
import { fetchJsonGet } from "../../utils/fetch";
import useStateObj from "../../utils/useStateObj";

class Game
{
	public barPercent = "50";
	public error: string | null = null;
	public get isGoing() { return this.state?.state == "going"; }
	public get opponentLeftId() { return this.state?.oponent1Id || -1; }
	public get opponentRightId() { return this.state?.oponent2Id || -1; }
	public get winnerId() { return this.state?.winner == 1 ? this.opponentLeftId : this.state?.winner == 2 ? this.opponentRightId : -1; }
	public get titleType()
	{
		if (this.error) return "error";
		return ({
			wait: "wait",
			start: "counter",
			going: "counter",
			end: "winner",
			"": ""
		}[this.state?.state || ""] || "load") as "error" | "wait" | "counter" | "winner" | "load";
	}

	private updateScreen?: () => void;
	private state: GameStateFull | null = null;
	private startI = 0;
	private counterTimer?: NodeJS.Timer;
	private stoped = false;

	public start(updateScreen: () => void)
	{
		this.stoped = false;
		this.startI++;
		this.updateScreen = updateScreen;
		this.updateState(this.startI);
		this.counterTimer = setInterval(() => this.counter(), 1000);
	}

	public stop()
	{
		this.stoped = true;
		this.startI++;
		clearInterval(this.counterTimer);
	}

	private counter()
	{
		if (this.stoped || !this.state) return;

		if (this.state.counter > 0)
		{
			this.state.counter--;
			this.updateScreen?.();
		}
	}

	private async updateState(startI: number)
	{
		if (startI != this.startI) return;
		const updateStart = new Date();
		try
		{
			const newState = await fetchJsonGet<GameStateFull>("/api/game/state_full");
			if (startI != this.startI) return;
			this.state = newState;
			this.error = null;
		}
		catch (e)
		{
			if (startI != this.startI) return;
			this.state = null;
			this.error = formatError(e);
			this.updateScreen?.();
			return;
		}
		finally
		{
			if (startI != this.startI) return;
			const now = new Date();
			const dt = +now - +updateStart;
			const delay = this.state?.state == "going" ? 1000 : 5000;
			setTimeout(() => this.updateState(startI), Math.max(0, delay - dt));
		}
		this.onNewState();
		this.updateScreen?.();
	}

	private onNewState()
	{
		if (!this.state) return;

		this.barPercent = this.getBarPercent(this.state);
	}

	public getCounter()
	{
		if (!this.state) return "0:00";
		return `${Math.floor(this.state.counter / 60)}:${(this.state.counter % 60).toString().padStart(2, "0")}`;
	}

	private getBarPercent(data: GameStateFull)
	{
		const sum = data.clicks1 + data.clicks2;
		if (sum == 0) return "50";
		return `${data.clicks1 / sum * 100}`;
	}
}

const game = new Game();
export function useGame()
{
	const update = useStateObj(0);
	useEffect(() =>
	{
		game.start(() => update.set(v => v + 1));
		return () => game.stop();
		// eslint-disable-next-line
	}, []);
	return game;
}
