import { useRef, useState } from "react";
import useUser, { useMutationChangeName } from "../../api/user";
import Layout from "../../components/Layout";
import styles from "./styles.module.css"
import displayError from "../../utils/displayError";
import Spinner from "../../components/Spinner";

export default function ProfilePage()
{
	const user = useUser();
	const nameRef = useRef<HTMLInputElement>(null);
	const [userNameEditing, setUserNameEditing] = useState(false);
	const nameMutation = useMutationChangeName();

	return (
		<Layout centered gap="1rem">
			<div className={styles.root}>
				{displayError(nameMutation)}
				{nameMutation.isLoading && <Spinner />}
				<div>
					<img className={styles.img} src={user.data?.photo} />
					<h3>Имя</h3>
					<div>
						<input type="text" ref={nameRef} defaultValue={user.data?.name} disabled={!userNameEditing} className={styles.input} />
					</div>
					<div>
						{!userNameEditing && <button onClick={() => setUserNameEditing(true)} className="button button_small">Изменить</button>}
						{userNameEditing && <button onClick={() =>
						{
							setUserNameEditing(false);
							if (nameRef.current)
								nameRef.current.value = user.data?.name || "";
						}}
							className="button button_small"
						>
							Отмена
						</button>}
						{userNameEditing && <button
							onClick={() =>
							{
								setUserNameEditing(false);
								if (nameRef.current)
									nameMutation.mutate({ name: nameRef.current.value });
							}}
							className="button button_small"
						>
							Сохранить
						</button>}
					</div>
				</div>
				<div>
					<h3>Фамилия</h3>
					{user.data?.last_name}
				</div>
				<div>
					<h3>Роли</h3>
					{user.data?.roles.map((v, i) => <div key={i}>{v}</div>)}
				</div>
			</div>
		</Layout>
	);
}
