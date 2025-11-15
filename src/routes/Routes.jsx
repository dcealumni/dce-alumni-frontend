import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Alumni from "../pages/Alumni";
import Committee from "../pages/Committee";
import PastEvent from "../pages/PastEvent";
import Register from "../pages/Register";
import Login from "../pages/Login";
import VerifyEmail from "../pages/VerifyEmail";

import Profile from "../pages/Profile";
import Contact from "../pages/Contact";
import Research from "../pages/Research/Research";
import ResearchProfile from "../pages/Research/ResearchFillProfile/ResearchProfile";
import ErrorBoundary from "../components/ErrorBoundary";
import Dashboard from "../Layout/Dashboard";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import AdminsPage from "../pages/Dashboard/AdminsPage";
import AlumniPage from "../pages/Dashboard/AlumniPage";
import AlumniRequestsPage from "../pages/Dashboard/AlumniRequestsPage";
import UsersPage from "../pages/Dashboard/UsersPage";
import CommitteePage from "../pages/Dashboard/CommitteePage";
import NotFound from "../pages/NotFound";
import AddCommitteeMember from "../pages/Dashboard/AddCommitteeMember";
import EditCommitteeMember from "../pages/Dashboard/EditCommitteeMember";
import NewsEventsPage from "../pages/Dashboard/NewsEventsPage";
import AddEventPage from "../pages/Dashboard/AddEventPage";
import EditEventPage from "../pages/Dashboard/EditEventPage";
import EventDetail from "../pages/EventDetail";
import LatestNews from "../pages/LatestNews";
import AddNewsPage from "../pages/Dashboard/AddNewsPage";
import AddUpcomingEventPage from "../pages/Dashboard/AddUpcomingEventPage";
import AddSuccessStory from "../pages/Dashboard/AddSuccessStory";
import AlumniSuccessStories from "../pages/AlumniSuccessStories";
import AllNews from "../pages/AllNews";
import AllPastEvents from "../pages/AllPastEvents";
import AllUpcomingEvents from "../pages/AllUpcomingEvents";
import { Main } from "../Layout/main";
import { PublicRoute } from "../Components/PublicRoute";
import { PrivateRoute } from "../Components/PrivateRoute";
import { AdminRoute } from "../Components/AdminRoute";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/alumni",
        element: <Alumni />,
      },
      {
        path: "/committee",
        element: <Committee />,
      },
      {
        path: "/past-events",
        element: <PastEvent />,
      },
      {
        path: "/register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },

      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ErrorBoundary>
              <Profile />
            </ErrorBoundary>
          </PrivateRoute>
        ),
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/research",
        element: <Research />,
      },
      {
        path: "/research-profile",
        element: (
          <PrivateRoute>
            <ErrorBoundary>
              <ResearchProfile />
            </ErrorBoundary>
          </PrivateRoute>
        ),
      },
      {
        path: "/alumni/success-stories",
        element: <AlumniSuccessStories />,
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </AdminRoute>
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardHome />,
          },
          {
            path: "admins",
            element: <AdminsPage />,
          },
          {
            path: "alumni",
            element: <AlumniPage />,
          },
          {
            path: "alumni-requests",
            element: <AlumniRequestsPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "committee",
            element: <CommitteePage />,
          },
          {
            path: "committee/add",
            element: <AddCommitteeMember />,
          },
          {
            path: "committee/edit/:id",
            element: <EditCommitteeMember />,
          },
          {
            path: "events",
            element: <NewsEventsPage />,
          },
          {
            path: "events/add",
            element: <AddEventPage />,
          },
          {
            path: "events/edit/:id",
            element: <EditEventPage />,
          },
          {
            path: "events/add-news",
            element: <AddNewsPage />,
          },
          {
            path: "events/add-upcoming",
            element: <AddUpcomingEventPage />,
          },
          {
            path: "events/add-success-story",
            element: <AddSuccessStory />,
          },
        ],
      },
      {
        path: "events",
        element: <PastEvent />,
      },
      {
        path: "events/:id",
        element: <EventDetail />,
      },
      {
        path: "/latest-news",
        element: <LatestNews />,
      },
      {
        path: "/news",
        element: <AllNews />,
      },
      {
        path: "/all-past-events",
        element: <AllPastEvents />,
      },
      {
        path: "/upcoming-events",
        element: <AllUpcomingEvents />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default routes;
