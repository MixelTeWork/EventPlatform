import Link from "next/link"

export default function Page()
{
	return (
		<div style={{
			background: "linear-gradient(0deg, #ffe87e, #ffdb6c)",
			width: "100%",
			display: "flex",
			flexDirection: "column",
			gap: "1.5em",
			alignItems: "center",
			justifyContent: "center",
		}}>
			<h3>Недостаточно прав для просмотра страницы</h3>
			<Link href="/" style={{
				color: "blue"
			}}>На главную</Link>
		</div>
	)
}