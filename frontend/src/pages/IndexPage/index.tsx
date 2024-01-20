import { Link } from "react-router-dom";
import hasPermission from "../../api/operations";
import useUser from "../../api/user";
import Layout from "../../components/Layout";

export default function IndexPage()
{
	const user = useUser();

	return (
		<Layout centered gap="1em">
			{hasPermission(user, "page_debug") && <Link to="/debug">{`</>`}</Link>}
		</Layout>
	);
}
