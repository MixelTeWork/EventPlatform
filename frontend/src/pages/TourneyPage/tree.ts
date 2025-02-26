import type { TourneyCharacter, TreeNode as ITreeNode } from "../../api/tourney";


export class Tree
{
	private tree: TreeNode;
	constructor(
		tree: ITreeNode,
		private characters: TourneyCharactersTreeData,
	)
	{
		this.tree = createTree(tree, this.characters);
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		this.tree.draw(ctx);
	}
}

interface TourneyCharacterTreeData
{
	id: number,
	name: string,
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

	public draw(ctx: CanvasRenderingContext2D)
	{
		ctx.save();
		ctx.fillStyle = "cyan";
		ctx.fillRect(0, 0, this.S * 3, this.S);
		ctx.strokeStyle = "magenta";
		ctx.lineWidth = 2;
		ctx.strokeRect(0, 0, this.S * 3, this.S);
		ctx.strokeRect(0, 0, this.S, this.S);
		const character = this.characters[this.data.characterId];
		if (character)
		{
			ctx.drawImage(character.img, 0, 0, this.S, this.S);
			ctx.font = "20px ZeroCool, Arial";
			ctx.fillStyle = "magenta";
			ctx.fillText(character.name, this.S * 1.1, this.S / 2, this.S * 1.9);
		}
		ctx.translate(this.S, this.S * 1.2);
		if (this.left)
		{
			this.left.draw(ctx);
			ctx.translate(0, this.S * 1.2 * this.left.getLen());
		}
		if (this.right) this.right.draw(ctx);
		ctx.restore();
	}

	private getLen(): number
	{
		if (!this.left && !this.right) return 1;
		if (this.left && this.right) return 1 + this.left.getLen() + this.right.getLen();
		if (this.left) return 1 + this.left.getLen();
		return 1 + this.right!.getLen();
	}
}

interface NodeData
{
	characterId: number,
}

function createTree(tree: ITreeNode, characters: TourneyCharactersTreeData): TreeNode
{
	return new TreeNode(
		characters,
		{ characterId: tree.characterId },
		tree.left && createTree(tree.left, characters),
		tree.right && createTree(tree.right, characters)
	);
}
