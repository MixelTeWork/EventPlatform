import React, { type ButtonHTMLAttributes } from "react"
import styles from "./styles.module.css"
import clsx from "@/utils/clsx";

export default function Button({ text, className, onClick, type, disabled, padding, size, calm = false, danger = false }: {
	text?: React.ReactNode,
	className?: string,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	type?: ButtonHTMLAttributes<HTMLButtonElement>["type"],
	padding?: boolean | string,
	calm?: boolean,
	disabled?: boolean,
	danger?: boolean,
	size?: string,
})
{
	return (
		<button
			className={clsx(styles.root, calm && styles.calm, danger && styles.danger, className)}
			onClick={onClick}
			type={type}
			disabled={disabled}
			style={{
				padding: typeof padding == "string" ? padding : padding ? "0.05em 0.3em" : undefined,
				width: size,
				height: size,
			}}
		>
			{text}
		</button>
	);
}
