import React, { type MouseEventHandler } from "react"
import styles from "./styles.module.css"
import clsx from "@/utils/clsx";
import type { StateObj } from "@/utils/useStateObj";

export default function Select<T>({ className, ref, onChange, value, stateObj, values, item, onClick }: {
	className?: string,
	ref?: React.Ref<HTMLSelectElement>,
	onChange?: React.ChangeEventHandler<HTMLSelectElement>,
	onClick?: MouseEventHandler<HTMLSelectElement>,
} & ({
	stateObj?: StateObj<number>,
	value?: never,
} | {
	stateObj?: never,
	value?: number,
}) & ({
	values: { [id: number]: T } | null | undefined,
	item: (item: T) => string,
} | {
	values: T[] | null | undefined,
	item: (item: T) => { id: number, text: string },
}))
{
	const items = !values ? [] : values instanceof Array ?
		values.map(it => (item as (item: T) => { id: number, text: string })(it)) :
		Object.keys(values).map(id => ({ id, text: (item as (item: T) => string)(values[parseInt(id, 10)]) }));
	return (
		<select
			className={clsx(styles.root, className)}
			ref={ref}
			value={value ?? stateObj?.v}
			onChange={e =>
			{
				stateObj?.set(parseInt(e.target.value, 10));
				onChange?.(e);
			}}
			onClick={onClick}
		>
			{items.map(it => <option key={it.id} value={it.id}>{it.text}</option>)}
		</select>
	);
}
