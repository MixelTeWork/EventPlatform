import Link from "next/link"

export default function NotFound()
{
	return (
		<div style={{
			background: "linear-gradient(0deg, #00164c, #000613)",
			color: "#b3e0ff",
			width: "100%",
			display: "flex",
			flexDirection: "column",
			gap: "1.5em",
			alignItems: "center",
			justifyContent: "center",
		}}>
			<h1>Такой страницы нет</h1>
			<Link href="/" style={{
				color: "blue"
			}}>На главную</Link>
		</div>
	)
}