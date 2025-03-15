import { useMutationAuthByTicket } from "../../api/auth";
import classNames from "../../utils/classNames";
import imagefileToData from "../../utils/imagefileToData";
import useStateObj from "../../utils/useStateObj";
import Spinner from "../Spinner";
import styles from "./styles.module.css"
import QrcodeDecoder from "qrcode-decoder/dist/index";

export default function AuthByTicketStdDesign({ open }: AuthByTicketProps)
{
	const error = useStateObj("");
	const mutation = useMutationAuthByTicket(error.set);

	return (
		<div className={classNames(styles.root, open && styles.open)}>
			{mutation.isLoading && <Spinner />}
			<div className={styles.body}>
				<div className={styles.message}>
					<div className={styles.message__fade}></div>
					<div className={styles.message__img}><div><div></div></div></div>
					<div className={styles.message__title}>Система</div>
					<div className={styles.message__text}>Обнаружено подключение! Протокол защиты активирован, требуется подтверждение доступа.</div>
				</div>
				<div className={styles.message2}>
					<div className={styles.message2__fade}></div>
					<div className={styles.message2__img}><div><div></div></div></div>
					<div className={styles.message2__title}>Дворецкий</div>
					<div className={styles.message2__text}>Вам нужно открыть картинку с билетом из галлереи вашего устройства.</div>
				</div>
				<div className={classNames(styles.message, styles.message_error, error.v && styles.message_error_open)}>
					<div className={styles.message__fade}></div>
					<div className={styles.message__img}><div><div></div></div></div>
					<div className={styles.message__title}>Система</div>
					<div className={styles.message__text}>В доступе отказано! {error.v}</div>
				</div>
				<label className={styles.openFile}>
					<div className={styles.openFile__fade}></div>
					<div>Открыть QR-код</div>
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
								return;
							}
							mutation.mutate({ code });
						}}
					/>
				</label>
			</div>
		</div>
	);
}

interface AuthByTicketProps
{
	open: boolean;
}
