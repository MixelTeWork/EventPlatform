import styles from "./styles.module.css"
import React from "react"
import clsx from "@/utils/clsx"
import type { StateObj } from "@/utils/useStateObj";

export default function Checkbox({ className, ref, required, stateObj, onChange, checked }: {
	className?: string,
	ref?: React.Ref<HTMLInputElement>,
	required?: boolean,
	onChange?: React.ChangeEventHandler<HTMLInputElement>,
} & ({
	stateObj?: StateObj<boolean>,
	checked?: never,
} | {
	stateObj?: never,
	checked?: boolean
}))
{
	return (
		<label className={clsx(styles.root, className)}>
			<input
				ref={ref}
				required={required}
				type={"checkbox"}
				checked={checked || stateObj?.v}
				onChange={e =>
				{
					stateObj?.set(e.target.checked);
					onChange?.(e);
				}}
			/>
			<span></span>
		</label>
	);
}
