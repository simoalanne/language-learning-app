import { useEffect, useState, useContext } from "react";
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
import axios from "axios";
import ManageTranslations from "./ManageTranslations";
import FlashcardMode from "./FlashcardMode";
import MatchingGameMode from "./MatchingGameMode";

const App = () => {
  const [wordGroups, setWordGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const { isAuthenticated, token } = useContext(AuthContext);
  useEffect(() => {
    const fetchData = async (url, setFunction) => {
      try {
        const response = await axios.get(`/api/${url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFunction(response.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };
    fetchData(`word-groups/${token ? "" : "public/"}`, setWordGroups);
    fetchData("languages/", setLanguages);
  }, [token]);

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
              To Be Named
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
                <LearnWords
                  wordGroups={wordGroups}
                  languageNames={languages.map((lang) => lang.languageName)}
                />
                <NewUserWalkthrough setWordGroups={setWordGroups} />
              </>
            }
          />
          <Route
            path="/manage-translations/:tab"
            element={
              isAuthenticated ? (
                <ManageTranslations
                  wordGroups={wordGroups}
                  languageNames={languages.map((lang) => lang.languageName)}
                  setWordGroups={setWordGroups}
                />
              ) : (
                <Navigate to="/learn" />
              )
            }
          />
          <Route
            path="/flashcards"
            element={<FlashcardMode wordGroups={wordGroups} />}
          />
          <Route
            path="/matching-game"
            element={<MatchingGameMode wordGroups={wordGroups} />}
          />
          <Route path="*" element={<Navigate to="/learn" />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
