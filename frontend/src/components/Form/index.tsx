import { useRef } from "react";
import classNames from "../../utils/classNames";
import styles from "./styles.module.css"

export function Form({ className, style, onSubmit, children }: FormProps)
{
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<form
			className={classNames(styles.form, className)}
			style={style}
			ref={formRef}
			onSubmit={e =>
			{
				e.preventDefault();
				if (!formRef.current) return;

				const data = new FormData(formRef.current);
				onSubmit(data);
			}}
		>
			{children}
		</form>
	);
}

interface FormProps extends React.PropsWithChildren
{
	onSubmit: (data: FormData) => void,
	className?: string,
	style?: React.StyleHTMLAttributes<HTMLFormElement>,
}


export function FormField({ label, className, style, children }: FormFieldProps)
{
	return (
		<label className={classNames(styles.field, className)} style={style}>
			<span>{label}</span>
			{children}
		</label>
	);
}

interface FormFieldProps extends React.PropsWithChildren
{
	label?: string,
	className?: string,
	style?: React.StyleHTMLAttributes<HTMLLabelElement>,
}
