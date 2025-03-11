import styles from "./styles.module.css"
import classNames from "../../utils/classNames";
import { useEffect, useRef } from "react";

export default function StyledWindow({ children, title = "Underparty", footer, className, scrollUpdate, onClose }: StyledWindowProps)
{
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() =>
	{
		if (contentRef.current)
			contentRef.current.scrollTo(0, 0);
		// eslint-disable-next-line
	}, [scrollUpdate])

	return (
		<div className={classNames(styles.root, className)}>
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

interface StyledWindowProps extends React.PropsWithChildren
{
	title?: string,
	footer?: React.ReactNode,
	className?: string,
	scrollUpdate?: any,
	disableScroll?: boolean,
	onClose?: () => void,
}