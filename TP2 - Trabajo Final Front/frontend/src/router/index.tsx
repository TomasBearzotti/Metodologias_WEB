import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Home } from "../pages/Home";
import { MovieDetail } from "../pages/MovieDetail";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Profile } from "../pages/Profile";
import { Admin } from "../pages/Admin";
import { Sessions } from "../pages/Sessions";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  // Fuera del Layout: pantalla completa para login y registro
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Catálogo público
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "movies/:id", element: <MovieDetail /> },

      // Rutas privadas para cualquier usuario autenticado
      {
        element: <ProtectedRoute />,
        children: [{ path: "perfil", element: <Profile /> }],
      },

      // Rutas exclusivas para rol admin
      {
        element: <ProtectedRoute roles={["admin"]} redirectTo="/perfil" />,
        children: [
          {
            path: "admin",
            children: [
              { index: true, element: <Admin /> },
              { path: "sesiones", element: <Sessions /> },
            ],
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
