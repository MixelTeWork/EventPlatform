import clsx from "@/utils/clsx";
import styles from "./styles.module.css"
import { useEffect, useRef } from "react";

export default function StyledWindow({ children, title = "Underparty", footer, className, scrollUpdate, onClose }: {
	title?: string,
	footer?: React.ReactNode,
	className?: string,
	scrollUpdate?: unknown,
	onClose?: () => void,
} & React.PropsWithChildren)
{
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() =>
	{
		if (contentRef.current)
			contentRef.current.scrollTo(0, 0);
		// eslint-disable-next-line
	}, [scrollUpdate])

	return (
		<div className={clsx(styles.root, className)}>
			<div className={styles.body}>
				<div ref={contentRef}>
					{children}
				</div>
			</div>
			<div>
				{footer}
			</div>
		</div>
	);
}
