import { Navigate, Route, Routes } from "react-router-dom";
import useUser from "./api/user";
import hasPermission, { Operation } from "./api/operations";
import Preloader from "./components/Preloader";
import ScrollToTop from "./utils/scrollToTop";
import displayError from "./utils/displayError";
import MessageFromBackend from "./components/MessageFromBackend";

import NotFoundPage from "./pages/NotFoundPage";
import NoPermissionPage from "./pages/NoPermissionPage";
import AuthPage from "./pages/AuthPage";
import IndexPage from "./pages/IndexPage";
import DebugPage from "./pages/DebugPage";
import UsersPage from "./pages/UsersPage";
import LogPage from "./pages/LogPage";
import ProfilePage from "./pages/ProfilePage";

export default function App()
{
	const user = useUser();

	function ProtectedRoute(permission: Operation | null, path: string, element: JSX.Element)
	{
		return <Route path={path} element={
			!user.data?.auth ? <Navigate to="/auth" /> : (
				permission == null || hasPermission(user, permission) ? element : <NoPermissionPage />
			)
		} />
	}

	return <div className="root">
		<ScrollToTop />
		<MessageFromBackend />

		{user.isLoading && <Preloader />}
		{displayError(user)}
		{user.isSuccess &&
			<Routes>
				<Route path="/auth" element={!user.data?.auth ? <AuthPage /> : <Navigate to="/" />} />
				<Route path="/" element={<IndexPage />} />
				{ProtectedRoute(null, "/profile", <ProfilePage />)}
				{ProtectedRoute("page_debug", "/debug", <DebugPage />)}
				{ProtectedRoute("page_debug", "/log", <LogPage />)}
				{ProtectedRoute("page_users", "/users", <UsersPage />)}
				{/* {ProtectedRoute(null, "/:id", <IndexPage />)} */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		}
	</div>
}
