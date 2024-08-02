import styles from "./styles.module.css"
import buttons from "./buttons.png";
import classNames from "../../utils/classNames";
import { useEffect, useRef } from "react";
import useStateBool from "../../utils/useStateBool";

export default function StyledWindow({ children, title = "Underparty", footer, className, disableScroll = false, onClose }: StyledWindowProps)
{
	const contentRef = useRef<HTMLDivElement>(null);
	const showArrows = useStateBool(true);

	useEffect(() =>
	{
		if (!contentRef.current) return;
		showArrows.set(contentRef.current.scrollHeight > contentRef.current.clientHeight);
		// eslint-disable-next-line
	}, [children, contentRef.current])

	return (
		<div className={classNames(styles.root, className)}>
			<div className={styles.header}>
				<div>{title}</div>
				<button onClick={onClose}>
					<img src={buttons} alt="close" />
				</button>
			</div>
			<div className={classNames(styles.body, !disableScroll && styles.body_scroll, (showArrows.v && !disableScroll) && styles.body_arrows)}>
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
	disableScroll?: boolean,
	onClose?: () => void,
}