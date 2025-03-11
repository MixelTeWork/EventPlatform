import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import IconHome from "../../../icons/home";
import classNames from "../../../utils/classNames";
import hasPermission from "../../../api/operations";
import useStateBool from "../../../utils/useStateBool";
import { useMutationLogout } from "../../../api/auth";
import useUser from "../../../api/user";
import Spinner from "../../Spinner";
import IconExit from "../../../icons/exit";
import IconCode from "../../../icons/code";
import IconWidgets from "../../../icons/widgets";

export default function SimpleHeader({ homeBtn = false, forStaff = false, forDev = false }: SimpleHeaderProps)
{
	const menuOpen = useStateBool(false);
	const navigate = useNavigate();
	const logout = useMutationLogout(menuOpen.setF);
	const user = useUser();

	return (
		<div className={classNames(styles.root, forStaff && styles.forStaff, forDev && styles.forDev)}>
			<Link to={"/"} className={styles.home}>
				{homeBtn && <IconHome />}
			</Link>
			<div className={styles.gap}></div>
			<div>{user.data?.balance || 0}М</div>
			<button className={classNames(styles.user, "clearBtn")} onClick={() => user.data?.auth ? menuOpen.set(v => !v) : navigate("/")}>
				<span>{user.data?.auth ? user.data?.name : "Войти"}</span>
				<img className={styles.img} src={user.data?.photo || avatar} alt="avatar" />
			</button>
			<div className={classNames(styles.menu, menuOpen.v && styles.menuVisible)}>
				<Link to={"/"}><IconHome /></Link>
				{/* <button onClick={() => navigate("/profile")}>
					Профиль
				</button> */}
				{hasPermission(user, "page_debug") && <Link to="/debug"><IconCode /></Link>}
				{hasPermission(user, "page_worker") && <Link to="/worker"><IconWidgets /></Link>}
				<button className="clearBtn" onClick={() => logout.mutate()} disabled={logout.status != "idle" && logout.status != "error"}>
					<IconExit />
				</button>
			</div>
			{logout.status == "loading" && <Spinner />}
		</div>
	);
}

interface SimpleHeaderProps
{
	homeBtn?: boolean
	forStaff?: boolean,
	forDev?: boolean,
}
