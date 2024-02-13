import styles from "./styles.module.css"
import buttons from "./buttons.png";
import classNames from "../../utils/classNames";

export default function StyledWindow({ children, footer, className, onClose }: StyledWindowProps)
{
	return (
		<div className={classNames(styles.root, className)}>
			<div className={styles.header}>
				<div>Underparty</div>
				<button onClick={onClose}>
					<img src={buttons} alt="close" />
				</button>
			</div>
			<div className={styles.body}>
				<div>
					{children}
				</div>
			</div>
			<div className={classNames(!!footer && styles.footer)}>
				{footer}
			</div>
		</div>
	);
}

interface StyledWindowProps extends React.PropsWithChildren
{
	footer?: React.ReactNode,
	className?: string,
	onClose?: () => void,
}