import HeaderBack from "../../components/HeaderBack";
import Layout from "../../components/Layout";

export default function NoPermissionPage()
{
	return (
		<Layout centered header={<HeaderBack />}>
			У вас недостаточно прав на просмотр этой страницы
		</Layout>
	);
}
