import styles from "./styles.module.css"
import { useEffect, useRef, useState } from "react";
import clsx from "@/utils/clsx";
import type { StateBool } from "@/utils/useStateBool";

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
	const [isOpen, setIsOpen] = useState(open);
	const [hidden, setHidden] = useState(!open);
	useEffect(() =>
	{
		if (open)
		{
			setHidden(false);
			const timeout = setTimeout(() => setIsOpen(true), 100);
			return () => clearTimeout(timeout);
		}
		setIsOpen(false);
		const timeout = setTimeout(() => setHidden(true), 250);
		return () => clearTimeout(timeout);
	}, [open]);

	return (
		<div
			ref={ref}
			className={clsx(styles.root, isOpen && styles.open, hidden && styles.hidden)}
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
