import { useEffect } from "react";
import { fetchJsonGet } from "../../utils/fetch";
import { type TourneyCharacter, type TourneyData } from "../../api/tourney";
import { formatError } from "../../utils/displayError";
import { Tree, type TourneyCharactersTreeData } from "./tree";

class Tourney
{
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private startI = 0;
	private pt = 0;
	private stoped = false;
	private error = "";

	private state: TourneyData | null = null;
	private characters?: TourneyCharacter[] | null;
	private transform = { dx: 0, dy: 0, s: 1 };
	private tree?: Tree;
	private x = 0;
	private y = 0;
	private dx = 1;
	private dy = 1;
	private s = 100;

	public start()
	{
		this.state = null;
		this.tree = undefined;
		this.stoped = false;
		this.error = "";
		this.startI++;
		this.loadCharacters();
		requestAnimationFrame(this.loop.bind(this, this.startI));
		this.updateState(this.startI);
		// @ts-ignore
		window.setTourneyTransform = (dx: number, dy: number, s: number) => this.transform = { dx, dy, s };
		// @ts-ignore
		window.setTourneyTransform(-50, -100, 0.35);
		// @ts-ignore
		window.setTourneyTransform(-50, -100, 0.6);
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
		try
		{
			const newState = await fetchJsonGet<TourneyData>("/api/tourney");
			if (startI != this.startI) return;
			this.state = newState;
			this.error = "";
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
		this.onNewState();
	}

	private async loadCharacters()
	{
		if (this.characters === null) return;
		this.characters = null;
		try
		{
			this.characters = await fetchJsonGet<TourneyCharacter[]>(`/api/tourney/characters`);
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
					this.ctx.font = "3em ZeroCool, Arial";
					this.ctx.fillStyle = "orange";
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
					this.ctx.font = "3em ZeroCool, Arial";
					this.ctx.fillStyle = "orange";
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
				this.draw();
			}
		}

		requestAnimationFrame(this.loop.bind(this, startI));
	}

	private draw()
	{
		if (!this.canvas || !this.ctx || !this.state || !this.characters) return;

		this.ctx.fillRect(this.x, this.y, this.s, this.s);

		const w = this.canvas.width;
		const h = this.canvas.height;

		this.ctx.save();
		this.ctx.translate(w / 2 + this.transform.dx, h / 2 + this.transform.dy);
		this.ctx.scale(this.transform.s, this.transform.s);
		this.tree?.draw(this.ctx);
		this.ctx.restore();
	}

	public setCanvas(canvas: HTMLCanvasElement)
	{
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.draw();
	}
}


const tourney = new Tourney();
export function useTourney()
{
	useEffect(() =>
	{
		tourney.start();
		return () => tourney.stop();
	}, []);
	return tourney;
}
