import styles from "./styles.module.css"
import buttons from "./buttons.png";
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
			<div className={styles.shadow}><div></div></div>
			<div className={styles.rootInner}>
				<div className={styles.header}>
					{/* <div>{title}</div> */}
					<div></div>
					<button onClick={onClose}>
						<img src={buttons} alt="close" />
					</button>
				</div>
				<div className={styles.bodyOuter}>
					<div className={styles.body}>
						<div ref={contentRef}>
							{children}
						</div>
					</div>
					<div>
						{footer}
					</div>
				</div>
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