import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import PublicProfile from "./pages/PublicProfile";

/**
 * App
 * - Central routing configuration
 * - Handles auth-based route protection
 */
function App() {
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? "/chat" : "/login"}
              replace
            />
          }
        />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/chat" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/chat" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Public profile (accessible without auth) */}
        <Route
          path="/u/:id"
          element={<PublicProfile />}
        />

        {/* Protected chat route */}
        <Route
          path="/chat"
          element={
            isAuthenticated ? (
              <Chat />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
