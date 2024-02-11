import styles from "./styles.module.css"

export default function Spinner({ color, zIndex, block, r = 0 }: SpinnerProps)
{
	return (
		<div className={styles.root} style={{ position: block ? "absolute" : "fixed", borderRadius: r }}>
			<div className={styles.spinner} style={{ "--color": color, zIndex } as React.CSSProperties}><div></div><div></div><div></div><div></div></div>
		</div>
	);
}

interface SpinnerProps
{
	color?: string,
	zIndex?: number,
	r?: number | string,
	block?: boolean
}