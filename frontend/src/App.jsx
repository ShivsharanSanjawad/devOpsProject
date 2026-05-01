import React from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import Landingpage from "./pages/Landingpage";
import Loginpage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";
import Homepage from "./pages/Homepage";
import GamePage from "./pages/Gamepage";
import CtrlFixItPage from './components/Gamepage/CtrlFixIt/CtrlFixItPage';
import BaseLayout from "./layouts/BaseLayout";
import Practicepage from "./pages/Practicepage";
import ProblemSolvingPage from "./pages/ProblemSolvingPage";
import ProblemLayout from "./layouts/ProblemLayout";
import CommunityPage from "./components/Community/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import ContestsPage from "./pages/ContestsPage";
import ContestArena from "./pages/ContestArena";
import MockInterviewPage from "./pages/MockInterviewPage";
import BlitzBattlePage from "./pages/BlitzBattlePage";
import SubmissionsPage from "./pages/SubmissionsPage";
import SolutionPage from "./pages/SolutionPage";
import OAuth2Callback from "./pages/OAuth2Callback";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route index element={<Landingpage />} />

        <Route path="home" element={<BaseLayout />}>
          <Route index element={<Homepage />} />
        </Route>

        <Route path="practice" element={<BaseLayout />}>
          <Route index element={<Practicepage />} />
        </Route>

        <Route path="submissions" element={<BaseLayout />}>
          <Route index element={<SubmissionsPage />} />
        </Route>

        <Route path="solutions" element={<BaseLayout />}>
          <Route path=":problemId" element={<SolutionPage />} />
        </Route>

        {/* Dynamic route mapping to problem/:problemId */}
        <Route path="problem" element={<ProblemLayout />}>
          <Route path=":problemId" element={<ProblemSolvingPage />} />
        </Route>

        <Route path="profile" element={<BaseLayout />}>
          <Route index element={<ProfilePage />} />
        </Route>

        <Route path="contests" element={<BaseLayout />}>
          <Route index element={<ContestsPage />} />
        </Route>

        <Route path="contest-arena" element={<ProblemLayout />}>
          <Route index element={<ContestArena />} />
        </Route>

        <Route path="login" element={<Loginpage />} />
        <Route path="register" element={<Registerpage />} />
        <Route path="oauth2/callback" element={<OAuth2Callback />} />
        
        <Route path="games" element={<BaseLayout />}>
          <Route index element={<GamePage />} />
        </Route>

        <Route path="interview" element={<ProblemLayout />}>
          <Route index element={<MockInterviewPage />} />
        </Route>

        <Route path="community" element={<ProblemLayout />}>
          <Route index element={<CommunityPage />} />
        </Route>

        <Route path="ctrl-fix-it" element={<CtrlFixItPage />} />
        <Route path="battle" element={<BlitzBattlePage />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;