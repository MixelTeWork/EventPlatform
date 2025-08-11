"use client"
import styles from "./page.module.css"
import { useRef, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { Form, FormField } from "@/components/Form";
import { useTitle } from "@/utils/useTtile";
import { useMutationAuth } from "@/api/user";
import useRedirectForAuthed from "@/utils/useRedirectForAuthed";

export default function Page()
{
	useTitle("Авторизация");
	useRedirectForAuthed("/map");
	const [error, setError] = useState("");
	const inp_login = useRef<HTMLInputElement>(null);
	const inp_password = useRef<HTMLInputElement>(null);
	const mutation = useMutationAuth(setError);

	function onSubmit()
	{
		const login = inp_login.current?.value || "";
		const password = inp_password.current?.value || "";
		mutation.mutate({ login, password });
	}

	return (
		<div className={styles.root}>
			<Link href="/" className={styles.back}></Link>
			<h2>Получено достижение!</h2>
			<h3>Вы не должны были это увидеть</h3>
			{error && <h3>{error}</h3>}
			{mutation.isPending && <Spinner />}
			<Form className={styles.form} onSubmit={onSubmit}>
				<FormField label="Логин">
					<input ref={inp_login} type="text" name="login" required />
				</FormField>
				<FormField label="Пароль">
					<input ref={inp_password} type="password" name="password" required />
				</FormField>
				<button type="submit" disabled={mutation.isPending}>Войти</button>
			</Form>
		</div>
	);
}
