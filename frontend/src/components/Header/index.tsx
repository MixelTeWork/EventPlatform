import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css"
import { useMutationLogout } from "../../api/auth";
import useUser from "../../api/user";
import Spinner from "../Spinner";
import { useState } from "react";
import classNames from "../../utils/classNames";
import hasPermission from "../../api/operations";

export default function Header({ color = "#042e40" }: HeaderProps)
{
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();
	const mutation = useMutationLogout(() =>
	{
		setMenuOpen(false);
	});
	const user = useUser();

	return (
		<div className={styles.root} style={{ background: color }}>
			<Link to={"/"} className={styles.home}></Link>
			<span className={styles.block}>
				<div className={styles.balance}>{user.data?.balance || 0} G</div>
				<button className={styles.user} onClick={() => user.data?.auth ? setMenuOpen(v => !v) : navigate("/")}>
					<span>{user.data?.auth ? user.data?.name : "Войти"}</span>
					{user.data?.photo && <img className={styles.img} src={user.data.photo} alt="avatar" />}
				</button>
				<div className={classNames(styles.menu, menuOpen && styles.menuVisible)} style={{ background: color }}>
					{/* <button onClick={() => navigate("/profile")}>
						Профиль
					</button> */}
					{hasPermission(user, "page_debug") && <Link to="/debug">{`</>`}</Link>}
					{hasPermission(user, "page_worker") && <Link to="/worker">[-^-]</Link>}
					<button onClick={() => mutation.mutate()} disabled={mutation.status != "idle"}>
						Выйти
					</button>
				</div>
			</span>
			{mutation.status == "loading" && <Spinner />}
		</div>
	);
}

interface HeaderProps
{
	color?: string,
}