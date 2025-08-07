import React, { type ButtonHTMLAttributes } from "react"
import styles from "./styles.module.css"
import clsx from "@/utils/clsx";

export default function Button({ text, className, onClick, type, padding }: {
	text?: React.ReactNode,
	className?: string,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	type?: ButtonHTMLAttributes<HTMLButtonElement>["type"],
	padding?: boolean | string,
})
{
	return (
		<button
			className={clsx(styles.root, className)}
			onClick={onClick}
			type={type}
			style={{ padding: typeof padding == "string" ? padding : padding ? "0.05em 0.3em" : undefined }}
		>
			{text}
		</button>
	);
}
