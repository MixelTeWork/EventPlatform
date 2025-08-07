import styles from "./styles.module.css"
import clsx from "@/utils/clsx";

export default function Title({ className, text, small = false }: TitleProps)
{
	return (
		<h1 className={clsx(styles.root, small && styles.small, className)}>{text}</h1>
	);
}

interface TitleProps
{
	text: string,
	small?: boolean
	className?: string;
}
