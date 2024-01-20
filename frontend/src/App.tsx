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
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import TimetablePage from "./pages/TimetablePage";
import QuestPage from "./pages/QuestPage";
import StorePage from "./pages/StorePage";

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
				<Route path="/" element={<IndexPage />} />
				<Route path="/login" element={!user.data?.auth ? <LoginPage /> : <Navigate to="/" />} />
				<Route path="/auth" element={!user.data?.auth ? <AuthPage /> : <Navigate to="/" />} />
				<Route path="/timetable" element={<TimetablePage />} />
				<Route path="/quest" element={<QuestPage />} />
				<Route path="/store" element={<StorePage />} />
				{/* <Route path="/race" element={<RacePage />} /> */}
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
