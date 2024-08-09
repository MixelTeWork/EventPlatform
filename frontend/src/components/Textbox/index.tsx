import classNames from "../../utils/classNames";
import styles from "./styles.module.css"
import btns from "./btns.png"

export default function Textbox({ children, type2 = false, btn = false, small = false, highlight = false, className }: TextboxProps)
{
	return (
		<div className={classNames(styles.root, type2 && styles.type2, small && styles.small, className)}>
			{highlight && <div className={classNames(styles.outline, styles.outline_back)}></div>}
			{highlight && <div className={classNames(styles.outline, styles.outline_front)}></div>}
			<div className={classNames(styles.box, styles.box_back)}></div>
			{btn && <span className={styles.btn}>
				<img src={btns} alt="" />
				{highlight && <div className={styles.btnOutline}></div>}
			</span>}
			<div className={classNames(styles.box, styles.box_front)}>{children}</div>
		</div>
	);
}


interface TextboxProps extends React.PropsWithChildren
{
	highlight?: boolean;
	btn?: boolean;
	small?: boolean;
	type2?: boolean;
	className?: string;
}
