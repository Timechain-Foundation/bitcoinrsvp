import "./App.css";
import Nav from "./components/nav/Nav";
import ApplicationForm from "./pages/application-form/ApplicationForm";
import { createBrowserRouter, RouterProvider } from "react-router";
import OragnizerApproval from "./pages/organizer/OrganizerApproval";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <ApplicationForm />,
    },
    {
      path: "/organizer",
      element: <OragnizerApproval />,
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
