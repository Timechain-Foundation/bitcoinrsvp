import "./App.css";
import Nav from "./components/nav/Nav";
import ApplicationForm from "./pages/application-form/ApplicationForm";
import { createBrowserRouter, RouterProvider } from "react-router";
import OrganizerApproval from "./pages/organizer/OrganizerApproval";
import EventManagement from "./components/event-management/EventManagement";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ApplicationForm />,
    },
    {
      path: "/organizer",
      element: <OrganizerApproval />,
    },
    {
      path: "/organizer/events",
      element: <EventManagement />,
    }
  ]);
  return (
    <div className="App">
      <Nav />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
