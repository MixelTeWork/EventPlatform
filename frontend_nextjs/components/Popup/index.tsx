import styles from "./styles.module.css"
import { useEffect, useRef } from "react";
import clsx from "@/utils/clsx";
import type { StateBool } from "@/utils/useStateBool";
import useStateBool from "@/utils/useStateBool";

export default function Popup({ children, open = false, close, openState, title = "", footer, closeOnOutclick = false }: {
	open?: boolean,
	close?: () => void,
	title?: string | React.ReactNode,
	closeOnOutclick?: boolean,
	footer?: React.ReactNode,
	openState?: StateBool,
} & React.PropsWithChildren)
{
	open = openState?.v || open;
	close = (openState?.setF && close) ? () => { openState.setF(); close?.(); } : openState?.setF || close;
	const ref = useRef<HTMLDivElement>(null)
	const isOpen = useStateBool(open);
	const hidden = useStateBool(!open);
	useEffect(() =>
	{
		if (open)
		{
			hidden.setF();
			const timeout = setTimeout(isOpen.setT, 100);
			return () => clearTimeout(timeout);
		}
		isOpen.setF();
		const timeout = setTimeout(hidden.setT, 250);
		return () => clearTimeout(timeout);
	}, [open]);

	useEffect(() =>
	{
		function keydown(e: KeyboardEvent)
		{
			if (e.key === "Escape" && open && closeOnOutclick)
				close?.();
		};
		window.addEventListener("keydown", keydown);
		return () => { window.removeEventListener("keydown", keydown); };
	}, [close, closeOnOutclick]);

	return (
		<div
			ref={ref}
			className={clsx(styles.root, isOpen.v && styles.open, hidden.v && styles.hidden)}
			onClick={e =>
			{
				if (closeOnOutclick && e.target == ref.current)
					close?.();
			}}
		>
			<div className={styles.popup}>
				{
					(title || close) &&
					<div className={styles.header}>
						{typeof title == "string" ? <h3>{title}</h3> : title}
						{close && <button className={styles.close} onClick={close}></button>}
					</div>
				}
				<div className={styles.body}>
					{children}
				</div>
				<div className={styles.footer}>
					{footer}
				</div>
			</div>
		</div>
	);
}
