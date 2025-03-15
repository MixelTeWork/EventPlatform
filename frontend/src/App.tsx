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
import DebugPage from "./pages/DebugPage";
import IndexPage from "./pages/IndexPage";
import LogPage from "./pages/LogPage";
// import LoginPage from "./pages/LoginPage";
import ManageQuestPage from "./pages/ManageQuestPage";
import ManageStorePage from "./pages/ManageStorePage";
import MapPage from "./pages/MapPage";
// import ProfilePage from "./pages/ProfilePage";
import PromotePage from "./pages/PromotePage";
import QuestPage from "./pages/QuestPage";
import ScannerPage from "./pages/ScannerPage";
import SendPage from "./pages/SendPage";
import StorePage from "./pages/StorePage";
import TimetablePage from "./pages/TimetablePage";
import UsersPage from "./pages/UsersPage";
import WorkerPage from "./pages/WorkerPage";
import WorkerQuestPage from "./pages/WorkerQuestPage";
import WorkerStorePage from "./pages/WorkerStorePage";
import GamePage from "./pages/GamePage";
import GameSettingsPage from "./pages/GameSettingsPage";
import GameScreenPage from "./pages/GameScreenPage";
import GameCharactersPage from "./pages/GameCharactersPage";
import TourneyPage from "./pages/TourneyPage";
import StatsPage from "./pages/StatsPage";
import ConfigPage from "./pages/ConfigPage";

export default function App()
{
	const user = useUser();

	function ProtectedRoute(permission: Operation | null, path: string, element: JSX.Element)
	{
		return <Route path={path} element={
			!user.data?.auth ? <Navigate to="/" /> : (
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
				{/* <Route path="/" element={<IndexPage />} /> */}
				<Route path="/" element={!user.data?.auth ? <IndexPage /> : <Navigate to="/map" />} />
				{/* <Route path="/login" element={!user.data?.auth ? <LoginPage /> : <Navigate to="/" />} /> */}
				<Route path="/auth" element={!user.data?.auth ? <AuthPage /> : <Navigate to="/" />} />
				<Route path="/timetable" element={<TimetablePage />} />
				<Route path="/quest" element={<QuestPage />} />
				<Route path="/store" element={<StorePage />} />
				<Route path="/map" element={<MapPage />} />
				{ProtectedRoute(null, "/game", <GamePage />)}
				{ProtectedRoute(null, "/scanner", <ScannerPage />)}
				{/* {ProtectedRoute(null, "/profile", <ProfilePage />)} */}
				{ProtectedRoute("page_worker", "/worker", <WorkerPage />)}
				{ProtectedRoute("manage_store", "/manage_store", <ManageStorePage />)}
				{ProtectedRoute("manage_quest", "/manage_quest", <ManageQuestPage />)}
				{ProtectedRoute("manage_games", "/game_characters", <GameCharactersPage />)}
				{ProtectedRoute("manage_games", "/game_settings", <GameSettingsPage />)}
				{ProtectedRoute("manage_games", "/game_screen", <GameScreenPage />)}
				{ProtectedRoute("manage_games", "/tourney_screen", <TourneyPage />)}
				{ProtectedRoute("page_worker_quest", "/worker_quest", <WorkerQuestPage />)}
				{ProtectedRoute("page_worker_store", "/worker_store", <WorkerStorePage />)}
				{ProtectedRoute("page_stats", "/stats", <StatsPage />)}
				{ProtectedRoute("site_config", "/config", <ConfigPage />)}
				{ProtectedRoute("promote_worker", "/promote_worker", <PromotePage role="worker" />)}
				{ProtectedRoute("promote_manager", "/promote_manager", <PromotePage role="manager" />)}
				{ProtectedRoute("send_any", "/send", <SendPage />)}
				{ProtectedRoute("page_debug", "/debug", <DebugPage />)}
				{ProtectedRoute("page_debug", "/log", <LogPage />)}
				{ProtectedRoute("page_users", "/users", <UsersPage />)}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		}
	</div>
}
