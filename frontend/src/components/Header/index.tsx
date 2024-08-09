import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import { useMutationLogout } from "../../api/auth";
import useUser from "../../api/user";
import Spinner from "../Spinner";
import { useState } from "react";
import classNames from "../../utils/classNames";
import hasPermission from "../../api/operations";
import IconHome from "../../icons/home";

export default function Header({ homeBtn = false }: HeaderProps)
{
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();
	const mutation = useMutationLogout(() =>
	{
		setMenuOpen(false);
	});
	const user = useUser();

	return (
		<div className={styles.root}>
			<Link to={"/"} className={styles.home}>
				{homeBtn && <IconHome />}
			</Link>
			<span className={styles.block}>
				<div className={classNames(styles.balance, "title")}>{user.data?.balance || 0}М</div>
				<button className={classNames(styles.user, "title")} onClick={() => user.data?.auth ? setMenuOpen(v => !v) : navigate("/")}>
					<span>{user.data?.auth ? user.data?.name : "Войти"}</span>
					<img className={styles.img} src={user.data?.photo || avatar} alt="avatar" />
				</button>
				<div className={classNames(styles.menu, menuOpen && styles.menuVisible)}>
					{/* <button onClick={() => navigate("/profile")}>
						Профиль
					</button> */}
					{hasPermission(user, "page_debug") && <Link to="/debug">{`</>`}</Link>}
					{hasPermission(user, "page_worker") && <Link to="/worker">[-^-]</Link>}
					<button onClick={() => mutation.mutate()} disabled={mutation.status != "idle" && mutation.status != "error"}>
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
	homeBtn?: boolean
}