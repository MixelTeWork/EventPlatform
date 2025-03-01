import type { TreeNode as ITreeNode, TourneyData } from "../../api/tourney";


export class Tree
{
	private tree: TreeNode;
	private third: TreeNode;

	constructor(
		data: TourneyData,
		private characters: TourneyCharactersTreeData,
	)
	{
		this.tree = new TreeNode(this.characters, { id: -1, characterId: -1 });
		this.third = new TreeNode(this.characters, { id: -1, characterId: -1 });
		this.updateData(data)
	}

	public updateData(data: TourneyData)
	{
		this.tree = createTree(data.tree, this.characters);
		if (data.tree.left && data.tree.right)
		{
			const left =
				data.tree.left.characterId == data.tree.left.left?.characterId ?
					data.tree.left.right : (
						data.tree.left.characterId == data.tree.left.right?.characterId ?
							data.tree.left.left : null
					);
			const right =
				data.tree.right.characterId == data.tree.right.left?.characterId ?
					data.tree.right.right : (
						data.tree.right.characterId == data.tree.right.right?.characterId ?
							data.tree.right.left : null
					);
			this.third = new TreeNode(this.characters, { id: -2, characterId: data.third },
				new TreeNode(this.characters, left || { id: -1, characterId: -1 }),
				new TreeNode(this.characters, right || { id: -1, characterId: -1 }),
			);
		}
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		this.tree.draw(ctx);
		this.third.draw(ctx, -1);
	}
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
	private S = 100;
	constructor(
		private characters: TourneyCharactersTreeData,
		private data: NodeData,
		private left: TreeNode | null = null,
		private right: TreeNode | null = null,
	) { }

	public draw(ctx: CanvasRenderingContext2D, type = 1)
	{
		ctx.save();
		const imgRight = [4, 5, 6, 7].includes(type);
		const character = this.characters[this.data.characterId];

		if (type == -1) ctx.translate(0, this.S * 4);

		ctx.fillStyle = "cyan";
		if (type == 1) ctx.fillStyle = "blue";
		ctx.fillRect(0, 0, this.S * 3, this.S);

		ctx.strokeStyle = "magenta";
		ctx.lineWidth = 2;

		ctx.strokeRect(0, 0, this.S * 3, this.S);

		if (character)
		{
			ctx.drawImage(character.img, imgRight ? this.S * 2 : 0, 0, this.S, this.S);
			ctx.font = "20px ZeroCool, Arial";
			ctx.fillStyle = "magenta";
			ctx.fillText(character.name, imgRight ? this.S * 0.1 : this.S * 1.1, this.S / 2, this.S * 1.9);
		}
		else if (type == 1)
		{
			ctx.font = "20px ZeroCool, Arial";
			ctx.fillStyle = "magenta";
			ctx.fillText("Winner", this.S * 1.1, this.S / 2, this.S * 1.9);
		}

		if (character) ctx.strokeStyle = character.color;
		ctx.strokeRect(imgRight ? this.S * 2 : 0, 0, this.S, this.S);

		// ctx.font = "40px ZeroCool, Arial";
		// ctx.fillStyle = "magenta";
		// ctx.fillText(`${type}`, this.S * 0.1, this.S / 2, this.S * 0.8);

		ctx.strokeStyle = "orange";
		ctx.lineWidth = 4;

		if (type == 1)
		{
			ctx.save();
			ctx.translate(0, -this.S * 1.5);
			if (this.left) this.left.draw(ctx, 2);
			ctx.translate(0, this.S * 3);
			if (this.right) this.right.draw(ctx, 3);
			ctx.restore();

			ctx.translate(this.S * 1.5, 0);
			this.drawLines(ctx,
				[[0, 0], [0, -0.5]],
				[[0, 1], [0, 0.5]],
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
			if (character) ctx.strokeStyle = character.color;
			this.drawLine0(ctx, [0, -4.9]);
		}
		else if (type == -3)
		{
			ctx.translate(this.S * 1.5, 0);
			if (character) ctx.strokeStyle = character.color;
			this.drawLine0(ctx, [0, -2.4]);
		}

		ctx.restore();
	}

	private drawLine(ctx: CanvasRenderingContext2D, ...points: [number, number][])
	{
		if (points.length == 0) return;
		points = points.map(v => ([v[0] * this.S, v[1] * this.S]));
		ctx.beginPath();
		let x = points[0][0];
		let y = points[0][1];
		ctx.moveTo(x, y);
		for (let i = 1; i < points.length; i++)
		{
			x += points[i][0];
			y += points[i][1];
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	private drawLine0(ctx: CanvasRenderingContext2D, ...points: [number, number][])
	{
		this.drawLine(ctx, [0, 0], ...points);
	}

	private drawLines(ctx: CanvasRenderingContext2D, left: [number, number][], right: [number, number][], zero = true)
	{
		const drawLine = zero ? this.drawLine0.bind(this) : this.drawLine.bind(this);
		const winner = this.data.characterId < 0 ? 0 : (this.data.characterId == this.left?.data.characterId ? -1 : (this.data.characterId == this.right?.data.characterId ? 1 : 0));
		ctx.strokeStyle = "gray";
		if (winner == 0)
		{
			if (this.left) drawLine(ctx, ...left);
			if (this.right) drawLine(ctx, ...right);
		}
		else
		{
			const character = this.characters[this.data.characterId];
			if (winner == -1)
			{
				if (this.right)
				{
					ctx.strokeStyle = this.characters[this.right.data.characterId]?.color;
					drawLine(ctx, ...right);
				}
				ctx.strokeStyle = character?.color;
				if (this.left) drawLine(ctx, ...left);
			}
			else
			{
				if (this.left)
				{
					ctx.strokeStyle = this.characters[this.left.data.characterId]?.color;
					drawLine(ctx, ...left);
				}
				ctx.strokeStyle = character?.color;
				if (this.right) drawLine(ctx, ...right);
			}
		}
	}
}

interface NodeData
{
	id: number,
	characterId: number,
}

function createTree(tree: ITreeNode, characters: TourneyCharactersTreeData): TreeNode
{
	return new TreeNode(
		characters,
		{ id: tree.id, characterId: tree.characterId },
		tree.left && createTree(tree.left, characters),
		tree.right && createTree(tree.right, characters)
	);
}
