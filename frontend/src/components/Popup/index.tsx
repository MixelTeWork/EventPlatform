import { useEffect, useRef, useState } from "react";
import classNames from "../../utils/classNames";
import styles from "./styles.module.css"

export default function Popup({ children, open = false, close, title = "", closeOnOutclick = false }: CustomPopupProps)
{
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
			className={classNames(styles.root, isOpen && styles.open, hidden && styles.hidden)}
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
						<h3>{title}</h3>
						{close && <button className={styles.close} onClick={close}></button>}
					</div>
				}
				<div className={styles.body}>
					{children}
				</div>
			</div>
		</div>
	);
}

export interface PopupProps
{
	open?: boolean,
	close?: () => void,
	title?: string,
	closeOnOutclick?: boolean,
}

type CustomPopupProps = PopupProps & React.PropsWithChildren;