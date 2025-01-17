import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CssBaseline, AppBar, Typography, Box } from "@mui/material";
import LogInOrRegisterButtons from "./Menu/LogInOrRegisterButtons";
import LoggedInButtons from "./Menu/LoggedInButtons";
import LearnWords from "./LearnWords";
import { AuthContext } from "./Authorisation/AuthContext";
import NewUserWalkthrough from "./Menu/NewUserWalkthrough";
import ManageTranslations from "./ManageTranslations";
import FlashcardMode from "./FlashcardMode";
import MatchingGameMode from "./MatchingGameMode";
import TestMode from "./TestMode";

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Router>
      <CssBaseline />
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(to right, #D1C4E9, #B3E5FC)" }}
      >
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
              mx: 1.5,
            }}
          >
            <Typography
              fontFamily="Impact, sans-serif"
              sx={{ fontSize: { xs: "1.25rem", sm: "2rem" } }}
            >
              Language App
            </Typography>
            {isAuthenticated ? <LoggedInButtons /> : <LogInOrRegisterButtons />}
          </Box>
        </>
      </AppBar>
      <Box component="main">
        <Routes>
          <Route
            path="/learn"
            element={
              <>
                <LearnWords />
                <NewUserWalkthrough />
              </>
            }
          />
          <Route
            path="/manage-translations/:tab"
            element={
              isAuthenticated ? (
                <ManageTranslations />
              ) : (
                <Navigate to="/learn" />
              )
            }
          />
          <Route path="/flashcards" element={<FlashcardMode />} />
          <Route path="/matching-game" element={<MatchingGameMode />} />
          <Route path="/test" element={<TestMode />} />
          <Route path="*" element={<Navigate to="/learn" />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
