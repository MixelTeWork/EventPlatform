import styles from "./styles.module.css"
import React, { type InputHTMLAttributes } from "react"
import clsx from "@/utils/clsx"
import type { StateObj } from "@/utils/useStateObj";

export default function Input<T extends React.HTMLInputTypeAttribute>({ className, ref, required = false, type = "text" as T, stateObj, value, onChange, checked }: {
	className?: string,
	ref?: React.Ref<HTMLInputElement>,
	required?: boolean,
	type?: T,
	onChange?: React.ChangeEventHandler<HTMLInputElement>,
} & ({
	stateObj?: StateObj<T extends "number" ? number : T extends "checkbox" ? boolean : string>,
	value?: never,
	checked?: never,
} | {
	stateObj?: never,
	value?: InputHTMLAttributes<HTMLInputElement>["value"],
	checked?: boolean,
}))
{
	const input = <input
		className={clsx(styles.root, className)}
		ref={ref}
		required={required}
		type={type}
		value={value || (typeof stateObj?.v == "boolean" ? undefined : stateObj?.v)}
		checked={checked || (typeof stateObj?.v == "boolean" ? stateObj?.v : undefined)}
		onChange={e =>
		{
			if (stateObj)
			{
				if (type == "number")
					stateObj.set(e.target.valueAsNumber as any);
				else if (type == "checkbox")
					stateObj.set(e.target.checked as any);
				else
					stateObj.set(e.target.value as any);
			}
			onChange?.(e);
		}}
	/>

	return type == "checkbox" ?
		<label className={styles.checkbox}>{input}<span></span></label>
		: input;
}
