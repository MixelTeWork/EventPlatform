import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css"
import { useMutationLogout } from "../../api/auth";
import useUser from "../../api/user";
import Spinner from "../Spinner";
import { useState } from "react";
import classNames from "../../utils/classNames";
import hasPermission from "../../api/operations";

export default function Header()
{
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();
	const mutation = useMutationLogout();
	const user = useUser();

	return (
		<div className={styles.root}>
			<Link to={"/"} className={styles.home}></Link>
			<span className={styles.block}>
				<div className={styles.balance}>{user.data?.balance || 0} G</div>
				<button className={styles.user} onClick={() => user.data?.auth ? setMenuOpen(v => !v) : navigate("/auth")}>
					<span>{user.data?.auth ? user.data?.name : "Войти"}</span>
				</button>
				<div className={classNames(styles.menu, menuOpen && styles.menuVisible)}>
					<button onClick={() => navigate("/profile")}>
						Профиль
					</button>
					{hasPermission(user, "page_debug") && <Link to="/debug">{`</>`}</Link>}
					<button onClick={() => mutation.mutate()} disabled={mutation.status != "idle"}>
						Выйти
					</button>
				</div>
			</span>
			{mutation.status != "idle" && <Spinner />}
		</div>
	);
}
