import { useEffect } from "react";
import type { GameStateFull } from "../../api/game";
import { formatError } from "../../utils/displayError";
import { fetchJsonGet } from "../../utils/fetch";
import useStateObj from "../../utils/useStateObj";

class Game
{
	public title = <span></span>;
	public barPercent = "50";
	public textLeft = "Вернуться";
	public textCenter = "Персонажи должны...";
	public textRight = "Остаться";
	public get isGoing() { return this.state?.state == "going"; }

	private updateScreen?: () => void;
	private state: GameStateFull | null = null;
	private updateTimeout?: NodeJS.Timeout;
	private counterTimer?: NodeJS.Timer;
	private stoped = false;

	public stop()
	{
		this.stoped = true;
		clearTimeout(this.updateTimeout);
		clearInterval(this.counterTimer);
	}

	public start(updateScreen: () => void)
	{
		this.stoped = false;
		this.updateScreen = updateScreen;
		this.update();
		this.counterTimer = setInterval(() => this.counter(), 1000);
	}

	private counter()
	{
		if (this.stoped || !this.state) return;

		if (this.state.counter > 0)
		{
			this.state.counter--;
			this.title = <span>{this.getCounter()}</span>
			this.updateScreen?.();
		}
	}

	private async update()
	{
		if (this.stoped) return;
		const updateStart = new Date();
		try
		{
			this.state = await fetchJsonGet<GameStateFull>("/api/game/state_full");
		}
		catch (e)
		{
			this.state = null;
			this.title = <h3 style={{ color: "tomato", textAlign: "center" }}>{formatError(e)}</h3>;
			this.updateScreen?.();
			return;
		}
		finally
		{
			const now = new Date();
			const dt = +now - +updateStart;
			const delay = this.state?.state == "going" ? 1000 : 5000;
			clearTimeout(this.updateTimeout);
			this.updateTimeout = setTimeout(() => this.update(), Math.max(0, delay - dt));
		}
		this.onNewState();
		this.updateScreen?.();
	}

	private onNewState()
	{
		if (!this.state) return;

		this.barPercent = this.getBarPercent(this.state);

		if (this.state.state == "wait")
		{
			this.title = <span>Скоро начало!</span>;
		}
		else if (this.state.state == "start")
		{
			this.title = <span>{this.getCounter()}</span>
		}
		else if (this.state.state == "going")
		{
			this.title = <span>{this.getCounter()}</span>
		}
		else if (this.state.state == "end")
		{
			this.title = <>
				<span>Персонажи должны </span>
				<span className="title" style={{ marginLeft: "0.25em" }}>{this.state.winner == 1 ? "Вернуться" : "Остаться"}</span>
				<span>!</span>
			</>
		}
	}

	private getCounter()
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
	}, []);
	return game;
}
