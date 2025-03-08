import type { TreeNode as ITreeNode, TourneyData } from "../../api/tourney";


export class Tree
{
	private tree: TreeNode;
	private third: TreeNode;
	private transform = { dx: 0, dy: 0, s: 1 };
	private anim: ((dt: number, w: number, h: number) => boolean)[] = [];

	private readonly RECT = { x: -10.5 * TreeNode.S, y: -5.5 * TreeNode.S, w: 24 * TreeNode.S, h: 12 * TreeNode.S };
	private showRect = this.RECT;

	constructor(
		data: TourneyData,
		private characters: TourneyCharactersTreeData,
	)
	{
		this.tree = new TreeNode(this.characters, { id: -1, characterId: -1 }, -1);
		this.third = new TreeNode(this.characters, { id: -1, characterId: -1 }, -1);
		this.updateData(data)
		// @ts-ignore
		window.setTourneyTransform = (dx: number, dy: number, s: number) => this.transform = { dx, dy, s };
		// @ts-ignore
		window.setTourneyTransform(-50, -100, 0.35);
		// @ts-ignore
		window.setTourneyTransform(-50, -100, 0.6);
	}

	public updateData(data: TourneyData)
	{
		const init = this.tree.data.id == -1;
		if (init) this.tree = createTree(data.tree, data.curGameNodeId, this.characters);
		else this.tree.updateData(data.tree, data.curGameNodeId);

		const leftNode = data.tree.left;
		const rightNode = data.tree.right;
		if (leftNode && rightNode)
		{
			const left =
				(leftNode.characterId <= 0 ? null :
					leftNode.characterId == leftNode.left?.characterId ? leftNode.right : leftNode.left)
				|| { id: -2, characterId: -1, left: null, right: null };
			const right =
				(rightNode.characterId <= 0 ? null :
					rightNode.characterId == rightNode.left?.characterId ? rightNode.right : rightNode.left)
				|| { id: -2, characterId: -1, left: null, right: null };
			const lnode = new TreeNode(this.characters, left, data.curGameNodeId);
			const rnode = new TreeNode(this.characters, right, data.curGameNodeId);
			if (init)
			{
				this.third = new TreeNode(this.characters, { id: -3, characterId: data.third },
					data.curGameNodeId, lnode, rnode);
				lnode.parent = this.third;
				rnode.parent = this.third;
			}
			else
			{
				this.third.updateData({ id: -3, characterId: data.third, left, right }, data.curGameNodeId)
			}
		}
		let newRect = this.showRect;
		if (data.curGameNodeId >= 0)
		{
			const rect = this.tree.getBounds(data.curGameNodeId);
			if (rect) newRect = rect;
			else newRect = this.RECT;
		}
		else if (data.curGameNodeId == -3)
		{
			newRect = { x: -2 * TreeNode.S, y: 3 * TreeNode.S, w: 7 * TreeNode.S, h: 4 * TreeNode.S };
		}
		else
		{
			newRect = this.RECT;
		}
		if (init)
		{
			this.showRect = newRect;
		}
		else if (JSON.stringify(newRect) != JSON.stringify(this.showRect))
		{
			const oldRect = this.showRect;
			const rect = { ...oldRect };
			this.showRect = newRect;
			let t = 0;
			const lerp = (a: number, b: number) => a + (b - a) * Math.sin(t * Math.PI / 2);
			this.anim.push((dt, w, h) =>
			{
				t += dt / 1000;
				rect.x = lerp(oldRect.x, newRect.x);
				rect.y = lerp(oldRect.y, newRect.y);
				rect.w = lerp(oldRect.w, newRect.w);
				rect.h = lerp(oldRect.h, newRect.h);
				this.transform.s = this.calcScale(rect, { w, h });
				const { cx, cy } = this.findRectCenter(rect);
				this.transform.dx = w / 2 - cx;
				this.transform.dy = h / 2 - cy;
				return t > 1;
			});
		}
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		ctx.save();
		ctx.translate(this.transform.dx, this.transform.dy);
		ctx.scale(this.transform.s, this.transform.s);
		this.third.draw(ctx, -1);
		this.tree.draw(ctx);
		ctx.strokeStyle = "red";
		ctx.lineWidth = 4;
		// ctx.strokeRect(this.showRect.x, this.showRect.y, this.showRect.w, this.showRect.h);
		ctx.restore();
	}

	public update(dt: number, w: number, h: number)
	{
		if (this.anim.length == 0)
		{
			this.transform.s = this.calcScale(this.showRect, { w, h });
			const { cx, cy } = this.findRectCenter(this.showRect);
			this.transform.dx = w / 2 - cx;
			this.transform.dy = h / 2 - cy;
			this.tree.update(dt);
			this.third.update(dt);
		}
		else
		{
			for (let i = this.anim.length - 1; i >= 0; i--)
				if (this.anim[i](dt, w, h))
					this.anim.splice(i, 1);
		}
	}

	private calcScale(rect: ISize, canvas: ISize, paddingR = 0.05)
	{
		const padding = { x: canvas.w * paddingR, y: canvas.h * paddingR };
		return Math.min(canvas.w / (rect.w + padding.x * 2), canvas.h / (rect.h + padding.y * 2));
	}

	private findRectCenter(rect: IRect)
	{
		return {
			cx: (rect.x + rect.w / 2) * this.transform.s,
			cy: (rect.y + rect.h / 2) * this.transform.s,
		}
	}
}

interface IRect
{
	x: number,
	y: number,
	w: number,
	h: number,
}
interface ISize
{
	w: number,
	h: number,
}

interface TourneyCharacterTreeData
{
	id: number,
	name: string,
	color: string,
	img: HTMLImageElement,
}

export interface TourneyCharactersTreeData
{
	[id: number]: TourneyCharacterTreeData;
}

class TreeNode
{
	public static readonly S = 100;
	public readonly S = TreeNode.S;
	private t = 0;
	private newCharacterId: number;
	public parent?: TreeNode;
	constructor(
		private characters: TourneyCharactersTreeData,
		public data: NodeData,
		private curGameNodeId: number,
		private left: TreeNode | null = null,
		private right: TreeNode | null = null,
	)
	{
		this.newCharacterId = data.characterId;
	}

	public draw(ctx: CanvasRenderingContext2D, type = 1)
	{
		ctx.save();
		const imgRight = [4, 5, 6, 7].includes(type);
		const character = this.characters[this.data.characterId];

		if (type == -1) ctx.translate(0, this.S * 4);

		ctx.fillStyle = "cyan";
		if (type == 1) ctx.fillStyle = "blue";
		if (this.data.id == this.curGameNodeId) ctx.fillStyle = "orange";
		ctx.fillRect(0, 0, this.S * 3, this.S);

		if (character)
		{
			ctx.drawImage(character.img, imgRight ? this.S * 2 : 0, 0, this.S, this.S);
			ctx.font = "20px ZeroCool, Arial";
			ctx.fillStyle = "magenta";
			ctx.fillText(character.name, imgRight ? this.S * 0.1 : this.S * 1.1, this.S / 2 + 10, this.S * 1.9);
		}
		else if (type == 1)
		{
			ctx.font = "20px ZeroCool, Arial";
			ctx.fillStyle = "magenta";
			ctx.fillText("Winner", this.S * 1.1, this.S / 2 + 10, this.S * 1.9);
		}

		ctx.strokeStyle = "gray";
		if (character) ctx.strokeStyle = character.color;
		ctx.lineWidth = 4;
		ctx.strokeRect(0, 0, this.S * 3, this.S);
		ctx.strokeRect(imgRight ? this.S * 2 : 0, 0, this.S, this.S);

		// ctx.font = "40px ZeroCool, Arial";
		// ctx.fillStyle = "magenta";
		// ctx.fillText(`${type}`, this.S * 0.1, this.S / 2 - 10, this.S * 0.8);
		// ctx.fillText(`${this.data.id}`, this.S * 0.1, this.S / 2 + 30, this.S * 0.8);

		if (this.parent && this.parent.data.characterId != -1 && this.parent.data.characterId != this.data.characterId)
		{
			ctx.fillStyle = "#00000055";
			ctx.fillRect(0, 0, this.S * 3, this.S);
		}

		ctx.strokeStyle = "gray";
		ctx.lineWidth = 4;

		if (type == 1)
		{
			ctx.save();
			ctx.translate(0, -this.S * 1.5)
			if (this.left) this.left.draw(ctx, 2);
			ctx.translate(0, this.S * 3);
			if (this.right) this.right.draw(ctx, 3);
			ctx.restore();

			ctx.translate(this.S * 1.5, 0);
			this.drawLines(ctx,
				[[0, 0], [0, -0.5]],
				[[0, 1], [0, 0.5]],
				true,
				false,
			);
		}
		else if (type == 2)
		{
			ctx.save();
			ctx.translate(-this.S * 4.5, this.S * 0.9);
			if (this.left) this.left.draw(ctx, 4);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 5);
			ctx.restore();

			ctx.translate(this.S * 1.5, 0);
			this.drawLines(ctx,
				[[0, -0.5], [-2, 0], [0, 2.5], [-0.5, 0], [0, -0.5], [-0.5, 0]],
				[[0, -0.5], [-2, 0], [0, 2.5], [-0.5, 0], [0, 0.5], [-0.5, 0]],
			)
		}
		else if (type == 3)
		{
			ctx.save();
			ctx.translate(this.S * 4.5, -this.S * 2.1);
			if (this.left) this.left.draw(ctx, 8);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 9);
			ctx.restore();

			ctx.translate(this.S * 1.5, this.S * 1);
			this.drawLines(ctx,
				[[0, 0.5], [2, 0], [0, -2.5], [0.5, 0], [0, -0.5], [0.5, 0]],
				[[0, 0.5], [2, 0], [0, -2.5], [0.5, 0], [0, 0.5], [0.5, 0]],
			);
		}
		else if (type == 4)
		{
			ctx.save();
			ctx.translate(-this.S * 2, -this.S * 3.4);
			if (this.left) this.left.draw(ctx, 6);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 7);
			ctx.restore();

			ctx.translate(this.S * 2, 0);
			this.drawLines(ctx,
				[[0, -2.3], [-0.5, 0], [0, -0.5], [-0.5, 0]],
				[[0, -2.3], [-0.5, 0], [0, 0.5], [-0.5, 0]],
			);
		}
		else if (type == 5)
		{
			ctx.save();
			ctx.translate(-this.S * 2, this.S * 2.2);
			if (this.left) this.left.draw(ctx, 6);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 7);
			ctx.restore();

			ctx.translate(this.S * 2, this.S * 1);
			this.drawLines(ctx,
				[[0, 2.3], [-0.5, 0], [0, -0.5], [-0.5, 0]],
				[[0, 2.3], [-0.5, 0], [0, 0.5], [-0.5, 0]],
			);
		}
		else if (type == 6)
		{
			ctx.save();
			ctx.translate(-this.S * 4, -this.S * 1.5);
			if (this.left) this.left.draw(ctx, 6);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 7);
			ctx.restore();

			ctx.translate(0, this.S * 0.5);
			this.drawLines(ctx,
				[[-0.5, 0], [0, -0.9], [-0.5, 0]],
				[[-0.5, 0], [0, -0.9], [-0.5, 0]],
			);
		}
		else if (type == 7)
		{
			ctx.save();
			ctx.translate(-this.S * 4, this.S * 0.3);
			if (this.left) this.left.draw(ctx, 6);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 7);
			ctx.restore();

			ctx.translate(0, this.S * 0.5);
			this.drawLines(ctx,
				[[-0.5, 0], [0, 0.9], [-0.5, 0]],
				[[-0.5, 0], [0, 0.9], [-0.5, 0]],
			);
		}
		else if (type == 8)
		{
			ctx.save();
			ctx.translate(this.S * 2, -this.S * 3.4);
			if (this.left) this.left.draw(ctx, 10);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 11);
			ctx.restore();

			ctx.translate(this.S * 1, 0);
			this.drawLines(ctx,
				[[0, -2.3], [0.5, 0], [0, -0.5], [0.5, 0]],
				[[0, -2.3], [0.5, 0], [0, 0.5], [0.5, 0]],
			);
		}
		else if (type == 9)
		{
			ctx.save();
			ctx.translate(this.S * 2, this.S * 2.2);
			if (this.left) this.left.draw(ctx, 10);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 11);
			ctx.restore();

			ctx.translate(this.S * 1, this.S * 1);
			this.drawLines(ctx,
				[[0, 2.3], [0.5, 0], [0, -0.5], [0.5, 0]],
				[[0, 2.3], [0.5, 0], [0, 0.5], [0.5, 0]],
			);
		}
		else if (type == 10)
		{
			ctx.save();
			ctx.translate(this.S * 4, -this.S * 1.5);
			if (this.left) this.left.draw(ctx, 10);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 11);
			ctx.restore();

			ctx.translate(this.S * 3, this.S * 0.5);
			this.drawLines(ctx,
				[[0.5, 0], [0, -0.9], [0.5, 0]],
				[[0.5, 0], [0, -0.9], [0.5, 0]],
			);
		}
		else if (type == 11)
		{
			ctx.save();
			ctx.translate(this.S * 4, this.S * 0.3);
			if (this.left) this.left.draw(ctx, 10);
			ctx.translate(0, this.S * 1.2);
			if (this.right) this.right.draw(ctx, 11);
			ctx.restore();

			ctx.translate(this.S * 3, this.S * 0.5);
			this.drawLines(ctx,
				[[0.5, 0], [0, 0.9], [0.5, 0]],
				[[0.5, 0], [0, 0.9], [0.5, 0]],
			);
		}
		else if (type == -1)
		{
			ctx.save();
			ctx.translate(-this.S * 2, this.S * 1.4);
			if (this.left) this.left.draw(ctx, -2);
			ctx.translate(this.S * 4, 0);
			if (this.right) this.right.draw(ctx, -3);
			ctx.restore();

			ctx.translate(this.S * 1.5, this.S * 1);
			this.drawLines(ctx,
				[[0, 0.9], [-0.5, 0]],
				[[0, 0.9], [0.5, 0]],
			);
		}
		else if (type == -2)
		{
			ctx.translate(this.S * 1.5, 0);
			this.drawLine0(ctx, [[0, -4.9]]);
			const newCharacter = this.characters[this.newCharacterId];
			if (newCharacter) ctx.strokeStyle = newCharacter.color;
			const t = this.data.characterId == this.newCharacterId ? 1 : this.t;
			// this.drawLine0(ctx, [[0, -4.9]], true, t);
			this.drawLine0(ctx, [[0, -4.9], [-0.5, 0], [0, 0.5], [-0.5, 0]], true, t);
		}
		else if (type == -3)
		{
			ctx.translate(this.S * 1.5, 0);
			this.drawLine0(ctx, [[0, -4.9]]);
			const newCharacter = this.characters[this.newCharacterId];
			if (newCharacter) ctx.strokeStyle = newCharacter.color;
			const t = this.data.characterId == this.newCharacterId ? 1 : this.t;
			// this.drawLine0(ctx, [[0, -2.4]], true, t);
			this.drawLine0(ctx, [[0, -4.9], [0.5, 0], [0, 0.5], [0.5, 0]], true, t);
		}

		ctx.restore();
	}

	public update(dt: number)
	{
		this.t += dt / 1500;
		if (this.t > 1)
		{
			this.data.characterId = this.newCharacterId;
		}

		this.left?.update(dt);
		this.right?.update(dt);
	}

	private drawLine(ctx: CanvasRenderingContext2D, points: [number, number][], reverse = false, t = 1)
	{
		if (points.length == 0) return;
		points = points.map(v => ([v[0] * this.S, v[1] * this.S]));
		const len = points.reduce((p, v) => p + Math.abs(v[0]) + Math.abs(v[1]), 0) * t;
		if (reverse)
		{
			let x = points[0][0];
			let y = points[0][1];
			for (let i = 1; i < points.length; i++)
			{
				x += points[i][0];
				y += points[i][1];
				points[i][0] *= -1;
				points[i][1] *= -1;
			}
			points.push([x, y]);
			points.reverse();
			points.pop();
		}
		ctx.beginPath();
		let x = points[0][0];
		let y = points[0][1];
		ctx.moveTo(x, y);
		let l = 0;
		for (let i = 1; i < points.length; i++)
		{
			if (l > len) break;
			const dl = Math.abs(points[i][0]) + Math.abs(points[i][1]);
			const lt = l + dl < len ? 1 : (len - l) / dl;
			l += dl;
			x += points[i][0] * lt;
			y += points[i][1] * lt;
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	private _drawLine(ctx: CanvasRenderingContext2D, points: [number, number][], t = 1)
	{
		if (points.length == 0) return;
		points = points.map(v => ([v[0] * this.S, v[1] * this.S]));
		ctx.beginPath();
		let x = points[0][0];
		let y = points[0][1];
		ctx.moveTo(x, y);
		for (let i = 1; i < points.length; i++)
		{
			x += points[i][0] * t;
			y += points[i][1] * t;
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	private drawLine0(ctx: CanvasRenderingContext2D, points: [number, number][], reverse = false, t = 1)
	{
		this.drawLine(ctx, [[0, 0], ...points], reverse, t);
	}

	private drawLines(ctx: CanvasRenderingContext2D, left: [number, number][], right: [number, number][], reverse = true, zero = true)
	{
		const _drawLine = zero ? this.drawLine0.bind(this) : this.drawLine.bind(this);
		const drawLine = (points: [number, number][], t: number = 1) => _drawLine(ctx, points, reverse, t);
		const winner = this.newCharacterId < 0 ? 0 : (this.newCharacterId == this.left?.data.characterId ? -1 : (this.newCharacterId == this.right?.data.characterId ? 1 : 0));
		const t = this.data.characterId == this.newCharacterId ? 1 : this.t;
		if (this.left) drawLine(left);
		if (this.right) drawLine(right);
		if (winner != 0)
		{
			const character = this.characters[this.newCharacterId];
			if (winner == -1)
			{
				if (this.right)
				{
					ctx.strokeStyle = this.characters[this.right.data.characterId]?.color;
					drawLine(right, t);
				}
				ctx.strokeStyle = character?.color;
				if (this.left) drawLine(left, t);
			}
			else
			{
				if (this.left)
				{
					ctx.strokeStyle = this.characters[this.left.data.characterId]?.color;
					drawLine(left, t);
				}
				ctx.strokeStyle = character?.color;
				if (this.right) drawLine(right, t);
			}
		}
	}

	public getBounds(curGameNodeId: number, type = "1"): IRect | null | undefined
	{
		const r = (x: number, y: number, w: number, h: number, nl: string = "", nr: string = "") =>
		{
			if (curGameNodeId == this.data.id)
				return { x: x * this.S, y: y * this.S, w: w * this.S, h: h * this.S }
			else
				return this.left?.getBounds(curGameNodeId, nl) || this.right?.getBounds(curGameNodeId, nr);
		}
		if (type == "1") return r(-1, -2, 5, 5, "2", "3");
		else if (type == "2") return r(-4.5, -2, 8, 4, "4", "5");
		else if (type == "4") return r(-6.5, -4, 5, 4.5, "6", "7");
		else if (type == "5") return r(-6.5, 0.5, 5, 4.5, "6.5", "7.5");
		else if (type == "6") return r(-10.5, -5.5, 8, 5.2);
		else if (type == "7") return r(-10.5, -5.5, 8, 5.2);
		else if (type == "6.5") return r(-10.5, 1.3, 8, 5.2);
		else if (type == "7.5") return r(-10.5, 1.3, 8, 5.2);
		else if (type == "3") return r(0, -1, 8, 4, "8", "9");
		else if (type == "8") return r(4.5, -4, 5, 4.5, "10", "11");
		else if (type == "9") return r(4.5, 0.5, 5, 4.5, "10.5", "11.5");
		else if (type == "10") return r(5.5, -5.5, 8, 5.2);
		else if (type == "11") return r(5.5, -5.5, 8, 5.2);
		else if (type == "10.5") return r(5.5, 1.3, 8, 5.2);
		else if (type == "11.5") return r(5.5, 1.3, 8, 5.2);
		return null;
	}

	public updateData(data: ITreeNode, curGameNodeId: number)
	{
		this.newCharacterId = data.characterId;
		this.curGameNodeId = curGameNodeId
		this.t = 0;
		if (data.left) this.left?.updateData(data.left, curGameNodeId);
		if (data.right) this.right?.updateData(data.right, curGameNodeId);
	}
}

interface NodeData
{
	id: number,
	characterId: number,
}

function createTree(tree: ITreeNode, curGameNodeId: number, characters: TourneyCharactersTreeData): TreeNode
{
	const left = tree.left && createTree(tree.left, curGameNodeId, characters);
	const right = tree.right && createTree(tree.right, curGameNodeId, characters);
	const node = new TreeNode(
		characters,
		{ id: tree.id, characterId: tree.characterId },
		curGameNodeId,
		left,
		right,
	);
	if (left) left.parent = node;
	if (right) right.parent = node;
	return node;
}
