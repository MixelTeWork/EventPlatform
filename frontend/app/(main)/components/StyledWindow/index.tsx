import clsx from "@/utils/clsx";
import styles from "./styles.module.css"
import btns from "./btns.png"
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function StyledWindow({ children, footer, className, scrollUpdate, noPad=false, title="", onClose }: {
	title?: string,
	footer?: React.ReactNode,
	className?: string,
	scrollUpdate?: unknown,
	noPad?: boolean,
	onClose?: () => void,
} & React.PropsWithChildren)
{
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() =>
	{
		if (contentRef.current)
			contentRef.current.scrollTo(0, 0);
	}, [scrollUpdate])

	return (
		<div className={clsx(styles.root, className)}>
			<div className={styles.header}>
				<span>Indiecon.com/{title}</span>
				<button onClick={onClose}><Image src={btns} alt="btns" /></button>
			</div>
			<div className={clsx(styles.content, noPad && styles.noPad)}>
				<div className={styles.body}>
					<div ref={contentRef}>
						{children}
					</div>
				</div>
				<div className={styles.footer}>
					{footer}
				</div>
			</div>
		</div>
	);
}
