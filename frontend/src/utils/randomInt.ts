export default function randomInt(max: number): number;
export default function randomInt(min: number, max: number): number;
export default function randomInt(maxmin: number, max?: number)
{
	if (max != undefined)
		return Math.floor(Math.random() * (maxmin - max)) + max;
	return Math.floor(Math.random() * maxmin);
}