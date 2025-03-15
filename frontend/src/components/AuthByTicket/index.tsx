import { useMutationAuthByTicket } from "../../api/auth";
import classNames from "../../utils/classNames";
import imagefileToData from "../../utils/imagefileToData";
import useStateObj from "../../utils/useStateObj";
import Spinner from "../Spinner";
import styles from "./styles.module.css"
import logo from "./logo.png";
import avatar from "./avatar.png";
import QrcodeDecoder from "qrcode-decoder/dist/index";
import Textbox from "../Textbox";

export default function AuthByTicket({ open }: AuthByTicketProps)
{
	const error = useStateObj("");
	const mutation = useMutationAuthByTicket(error.set);

	return (
		<div className={classNames(styles.root, open && styles.open)}>
			{mutation.isLoading && <Spinner />}
			<div className={styles.body}>
				<Textbox className={styles.msgWide}>
					<div className={styles.msg1}>
						<img src={logo} alt="Инди кон" />
						<span>Загрузка системы...</span>
					</div>
				</Textbox>
				<Textbox type2 className={styles.msg2box}>
					<div className={styles.msg2}>
						<img src={avatar} alt="Avatar" />
						<h2 className="title">Админ</h2>
						<span>Добро пожаловать на Underparty "игрок"! Для того, чтобы попасть на сайт мероприятия, загрузи свой билет</span>
					</div>
				</Textbox>
				<Textbox type2 className={classNames(styles.msg2box, styles.msg_error, error.v && styles.msg_error_open)}>
					<div className={styles.msg2}>
						<img src={avatar} alt="Avatar" />
						<h2 className="title">Админ</h2>
						<span>В доступе отказано! {error.v}</span>
					</div>
				</Textbox>
				<Textbox className={classNames(styles.msg3, styles.msgWide)}>
					<label className={styles.openFile}>
						<div className="title">Загрузить билет</div>
						<input
							type="file"
							style={{ display: "none" }}
							accept="image/png, image/jpeg, image/gif"
							disabled={mutation.isLoading}
							onChange={async e =>
							{
								error.set("");
								const imgData = await imagefileToData(e.target?.files?.[0]!)
								e.target.value = "";
								if (!imgData) return;

								const qr = new QrcodeDecoder();
								const r = await qr.decodeFromImage(imgData.data);
								const code = r?.data;
								if (!code || !code.match(/\d+-\d+-\d+-\d+-\d+/))
								{
									error.set("Изображение не содержит QR-кода или он некорректный.");
									fetch("/api/auth_ticket_err", {method: "POST"})
									return;
								}
								mutation.mutate({ code });
							}}
						/>
					</label>
				</Textbox>
			</div>
		</div>
	);
}

interface AuthByTicketProps
{
	open: boolean;
}
