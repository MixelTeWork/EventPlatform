import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css"
import avatar from "./avatar.png";
import { useMutationLogout } from "../../api/auth";
import useUser from "../../api/user";
import Spinner from "../Spinner";
import classNames from "../../utils/classNames";
import hasPermission from "../../api/operations";
import IconHome from "../../icons/home";
import SimpleHeader from "./SimpleHeader";
import useStateBool from "../../utils/useStateBool";
import IconExit from "../../icons/exit";
import IconCode from "../../icons/code";
import IconWidgets from "../../icons/widgets";

export default function Header({ homeBtn = false, forStaff = false, forDev = false }: HeaderProps)
{
	const menuOpen = useStateBool(false);
	const navigate = useNavigate();
	const logout = useMutationLogout(menuOpen.setF);
	const user = useUser();

	return (forStaff || forDev) ? <SimpleHeader homeBtn={homeBtn} /> :
		<div className={styles.root}>
			<div className={styles.menu}>
				<Link to={"/"} className={styles.home}>
					{homeBtn && <IconHome />}
				</Link>
				{menuOpen.v && <>
					<button className="clearBtn" onClick={() => logout.mutate()} disabled={logout.status != "idle" && logout.status != "error"}>
						<IconExit />
					</button>
					{hasPermission(user, "page_debug") && <Link to="/debug"><IconCode /></Link>}
					{hasPermission(user, "page_worker") && <Link to="/worker"><IconWidgets /></Link>}
				</>}
			</div>
			<div className={styles.gap}></div>
			<div className={styles.text}>
				<div>{user.data?.name || "Войти ->"}</div>
				<div>{user.data?.balance} М</div>
			</div>
			<button className={classNames(styles.img, "clearBtn")} onClick={() => user.data?.auth ? menuOpen.set(v => !v) : navigate("/")}>
				<img src={user.data?.photo || avatar} alt="avatar" />
			</button>
			{logout.status == "loading" && <Spinner />}
		</div>
}

interface HeaderProps
{
	homeBtn?: boolean
	forStaff?: boolean,
	forDev?: boolean,
}