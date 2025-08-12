import styles from "./styles.module.css"
import { useRef } from "react";
import useStateBool from "@/utils/useStateBool";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import displayError from "@/utils/displayError";
import { Form, FormField } from "@/components/Form";
import Button from "@sCmps/Button";
import Input from "@sCmps/Input";
import { useMutationUserAdd } from "@/api/user";
import IconReload from "@icons/reload";

export default function AddUser()
{
	const loginRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const popupOpen = useStateBool(false);
	const mutationAdd = useMutationUserAdd(() =>
	{
		popupOpen.setF();
		if (nameRef.current) nameRef.current.value = "";
		if (passwordRef.current) passwordRef.current.value = "";
		if (nameRef.current) nameRef.current.value = "";
	});

	return <>
		<Button text="Add" onClick={popupOpen.setT} />
		<Popup title="Add user" openState={popupOpen}>
			{mutationAdd.isPending && <Spinner />}
			{displayError(mutationAdd)}
			<Form
				className={styles.form}
				onSubmit={() =>
				{
					const login = loginRef.current?.value;
					const password = passwordRef.current?.value;
					const name = nameRef.current?.value;
					const roles = [5];
					if (name && login && password)
						mutationAdd.mutate({
							login,
							password,
							name,
							roles,
						})
				}}
			>
				<FormField label="Login">
					<Input ref={loginRef} required type="text" />
				</FormField>
				<FormField label="Password">
					<div className={styles.password}>
						<Input ref={passwordRef} required type="text" />
						<Button padding text={<IconReload />} type="button" onClick={() =>
						{
							if (!passwordRef.current) return;
							passwordRef.current.value = `${window.crypto.randomUUID()}`.slice(0, 8);
						}} />
					</div>
				</FormField>
				<FormField label="Name">
					<Input ref={nameRef} required type="text" />
				</FormField>
				<FormField>
					<Button text="Add" type="submit" />
				</FormField>
			</Form>
		</Popup>
	</>
}
