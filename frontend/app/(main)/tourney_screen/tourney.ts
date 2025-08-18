import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchJsonGet } from "@/utils/fetch";
import { formatError } from "@/utils/displayError";
import { type TourneyCharacter, type TourneyData } from "@/api/tourney";
import { Tree, type TourneyCharactersTreeData } from "./tree";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

class Tourney
{
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private startI = 0;
	private pt = 0;
	private stoped = false;
	private error = "";
	private router: AppRouterInstance | null = null;

	private state: TourneyData | null = null;
	private stateIsFresh = false;
	private characters?: TourneyCharacter[] | null;
	private tree?: Tree;

	private x = 0;
	private y = 0;
	private dx = 1;
	private dy = 1;
	private s = 100;

	public start(router: AppRouterInstance)
	{
		this.router = router;
		this.stoped = false;
		this.stateIsFresh = false;
		this.error = "";
		this.startI++;
		this.loadCharacters();
		requestAnimationFrame(this.loop.bind(this, this.startI));
		this.updateState(this.startI);
	}

	public stop()
	{
		this.stoped = true;
		this.startI++;
	}

	private async updateState(startI: number)
	{
		if (startI != this.startI) return;
		const updateStart = new Date();
		const oldState = JSON.stringify(this.state);
		try
		{
			const newState = await fetchJsonGet<TourneyData>("/api/tourney");
			if (startI != this.startI) return;
			this.state = newState;
			this.error = "";
			this.stateIsFresh = true;
		}
		catch (e)
		{
			if (startI != this.startI) return;
			this.state = null;
			this.error = formatError(e);
			return;
		}
		finally
		{
			if (startI != this.startI) return;
			const now = new Date();
			const dt = +now - +updateStart;
			const delay = 1000;
			setTimeout(() => this.updateState(startI), Math.max(0, delay - dt));
		}
		if (JSON.stringify(this.state) != oldState)
			this.onNewState();
	}

	private async loadCharacters()
	{
		if (this.characters === null) return;
		try
		{
			this.characters = await fetchJsonGet<TourneyCharacter[]>(`/api/tourney/characters`);
			this.onNewState();
		}
		catch (e)
		{
			this.characters = undefined;
			this.error = formatError(e);
			return;
		}
	}

	private onNewState()
	{
		if (!this.state || !this.characters) return;
		if (this.tree)
		{
			this.tree.updateData(this.state);
		}
		else
		{
			const characters = {} as TourneyCharactersTreeData;
			this.characters.forEach(ch =>
			{
				const img = new Image();
				img.src = ch.img;
				characters[ch.id] = { ...ch, img };
			});
			this.tree = new Tree(this.state, characters);
		}
		if (this.stateIsFresh && !this.state.ended && this.state.showGame)
			this.router?.replace("/game_screen");
	}

	private loop(startI: number, t: number)
	{
		if (startI != this.startI) return;
		const dt = t - this.pt;
		this.pt = t;

		if (this.canvas)
		{
			const w = window.innerWidth;
			const h = window.innerHeight;
			this.canvas.width = w;
			this.canvas.height = h;

			if (this.error)
			{
				if (this.ctx)
				{
					this.ctx.save();
					this.ctx.font = "4em " + Tree.Font;
					this.ctx.fillStyle = Tree.Colors.onBack;
					const tm = this.ctx.measureText(this.error);
					this.ctx.fillText(this.error, Math.max(0, (w - tm.width) / 2), (h - tm.actualBoundingBoxAscent) / 2, w);
					this.ctx.restore();
				}
			}
			else if (!this.state || !this.characters)
			{
				if (this.ctx)
				{
					this.ctx.save();
					this.ctx.font = "5em " + Tree.Font;
					this.ctx.fillStyle = Tree.Colors.onBack;
					const text = "Загрузка";
					const tm = this.ctx.measureText(text);
					this.ctx.fillText(text, Math.max(0, (w - tm.width) / 2), (h - tm.actualBoundingBoxAscent) / 2, w);
					this.ctx.restore();
				}
			}
			else
			{
				this.x += this.dx * dt * 0.5;
				this.y += this.dy * dt * 0.5;
				if (this.x > this.canvas.width - this.s) { this.x = this.canvas.width - this.s; this.dx = -1 };
				if (this.x < 0) { this.x = 0; this.dx = 1 };
				if (this.y > this.canvas.height - this.s) { this.y = this.canvas.height - this.s; this.dy = -1 };
				if (this.y < 0) { this.y = 0; this.dy = 1 };
				this.tree?.update(dt, this.canvas.width, this.canvas.height);
				this.draw();
			}
		}

		requestAnimationFrame(this.loop.bind(this, startI));
	}

	private draw()
	{
		if (!this.canvas || !this.ctx || !this.state || !this.characters) return;

		// this.ctx.fillRect(this.x, this.y, this.s, this.s);

		this.tree?.draw(this.ctx);
	}

	public setCanvas(canvas: HTMLCanvasElement)
	{
		this.canvas = canvas;
		const compStyles = getComputedStyle(this.canvas);
		Tree.Font = compStyles.getPropertyValue("--font-ZeroCool");
		this.ctx = canvas.getContext("2d");
		this.draw();
	}
}


const tourney = new Tourney();
export function useTourney()
{
	const router = useRouter();
	useEffect(() =>
	{
		tourney.start(router);
		return () => tourney.stop();
		// eslint-disable-next-line
	}, []);
	return tourney;
}
