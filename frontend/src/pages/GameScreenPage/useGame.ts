import type { Team } from "../../api/game";
import useStateObj from "../../utils/useStateObj";

let s = 0;
const T = 250;

export default function useGame(raceDuration: number)
{
	const speed = T / (raceDuration * 1000);
	const state = useStateObj({
		title: "",
		t: 0,
		snail1: 0,
		snail2: 0,
		snail3: 0,
		snail4: 0,
		snailA1: 1,
		snailA2: 1,
		snailA3: 1,
		snailA4: 1,
		snailB1: 1,
		snailB2: 1,
		snailB3: 1,
		snailB4: 1,
		snailD1: 1,
		snailD2: 1,
		snailD3: 1,
		snailD4: 1,
		started: false,
		winner: "" as Team,
	});

	return {
		title: state.v.title,
		start: async () =>
		{
			const start = ++s;
			state.set(v => ({ ...v, title: "3..." }))
			await wait(1500);
			if (s != start) return;
			state.set(v => ({ ...v, title: "2..." }))
			await wait(1500);
			if (s != start) return;
			state.set(v => ({ ...v, title: "1..." }))
			await wait(1500);
			if (s != start) return;
			state.set(v => ({
				...v,
				title: "",
				started: true,
				t: 0,
				snailA1: Math.random() * 0.75 + 0.5,
				snailA2: Math.random() * 0.75 + 0.5,
				snailA3: Math.random() * 0.75 + 0.5,
				snailA4: Math.random() * 0.75 + 0.5,
				snailB1: Math.random() * 0.25 + 0.75,
				snailB2: Math.random() * 0.25 + 0.75,
				snailB3: Math.random() * 0.25 + 0.75,
				snailB4: Math.random() * 0.25 + 0.75,
				snailD1: Math.random() * 0.1 - 0.05,
				snailD2: Math.random() * 0.1 - 0.05,
				snailD3: Math.random() * 0.1 - 0.05,
				snailD4: Math.random() * 0.1 - 0.05,
			}))

			while (true)
			{
				if (s != start) return;
				state.set(v =>
				{
					const t = v.t + speed;
					const a = Math.min((t / 0.8), 1);
					const b = Math.min(Math.abs(t - 0.5) / (1 - 0.5), 1);
					const d = Math.max(t - 0.7, 0) / (1 - 0.7);
					// console.log(a, b, d);
					const snail1 = t * (v.snailA1 * (1 - a) + a) * (v.snailB1 * (1 - b) + b) + v.snailD1 * d;
					const snail2 = t * (v.snailA2 * (1 - a) + a) * (v.snailB2 * (1 - b) + b) + v.snailD2 * d;
					const snail3 = t * (v.snailA3 * (1 - a) + a) * (v.snailB3 * (1 - b) + b) + v.snailD3 * d;
					const snail4 = t * (v.snailA4 * (1 - a) + a) * (v.snailB4 * (1 - b) + b) + v.snailD4 * d;
					const max = Math.max(snail1, snail2, snail3, snail4);
					let winner = "blue" as Team;
					if (eq(snail1, max)) winner = "yellow";
					if (eq(snail2, max)) winner = "blue";
					if (eq(snail3, max)) winner = "red";
					if (eq(snail4, max)) winner = "green";
					if (t >= 1)
						s++
					return {
						...v,
						t,
						snail1,
						snail2,
						snail3,
						snail4,
						started: t < 1,
						winner: t < 1 ? "" : winner,
						title: t < 1 ? "" : "Финиш!",
					}
				});
				await wait(T);
			}
		},
		snail1: state.v.snail1,
		snail2: state.v.snail2,
		snail3: state.v.snail3,
		snail4: state.v.snail4,
		started: state.v.started,
		winner: state.v.winner,
	};
}

function wait(t: number)
{
	return new Promise<void>(resolve => setTimeout(resolve, t));
}
function eq(n1: number, n2: number)
{
	return Math.abs(n1 - n2) < 0.00001;
}