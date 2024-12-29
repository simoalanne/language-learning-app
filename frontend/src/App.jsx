import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";
import {
  Toolbar,
  CssBaseline,
  Drawer,
  List,
  Box,
  ListItemIcon,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import PersonIcon from "@mui/icons-material/Person";
import AddWordGroupDialog from "./AddWordGroupDialog";
import LearnWords from "./LearnWords";
import DeleteWordGroups from "./DeleteWordGroups";
import "./App.css";

const App = () => {
  const [wordGroups, setWordGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [words, setWords] = useState([]);

  const fetchData = async (url, setFunction) => {
    const response = await fetch(`api/${url}`);
    const data = await response.json();
    console.log(data);
    setFunction(data);
  };

  useEffect(() => {
    fetchData("word-groups/", setWordGroups);
    fetchData("languages/", setLanguages);
    fetchData("words/", setWords);
  }, []);

  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const sideNavSx = {
    m: 1,
    borderRadius: 3,
    "&.active": {
      color: "primary.main",
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      color: "primary.main",
    },
  };

  const bottomNavSx = {
    "&.active": {
      color: "primary.main",
    },
    "&:hover": {
      color: "primary.main",
    },
  };

  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
        }}
      >
        {/* Sidebar for larger screens */}
        {!isSmallScreen && (
          <Drawer
            variant="permanent"
            sx={{ width: 240 }}
          >
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
              <List>
                <ListItemButton sx={sideNavSx} component={NavLink} to="/learn">
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText primary="Learn" />
                </ListItemButton>
                <ListItemButton
                  sx={sideNavSx}
                  component={NavLink}
                  to="/manage-translations"
                >
                  <ListItemIcon>
                    <TranslateIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Translations" />
                </ListItemButton>
                <ListItemButton
                  sx={sideNavSx}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </List>
            </Box>
          </Drawer>
        )}

        {/* Main content area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route
              path="/learn"
              element={
                <LearnWords
                  wordGroups={wordGroups}
                  languageNames={languages.map((lang) => lang.languageName)}
                />
              }
            />
            <Route
              path="/manage-translations"
              element={
                <>
                  <AddWordGroupDialog
                    setWordGroups={setWordGroups}
                    words={words}
                    setWords={setWords}
                    languageNames={languages.map((lang) => lang.languageName)}
                  />
                  <DeleteWordGroups
                    wordGroups={wordGroups}
                    setWordGroups={setWordGroups}
                    setLanguages={setLanguages}
                    setWords={setWords}
                  />
                </>
              }
            />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </Box>

        {/* Bottom navigation for smaller screens */}
        {isSmallScreen && (
          <BottomNavigation
            sx={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              zIndex: 1000,
              bgcolor: "grey.100",
            }}
            showLabels
          >
            <BottomNavigationAction
              label="Learn"
              icon={<SchoolIcon />}
              component={NavLink}
              sx={bottomNavSx}
              to="/learn"
            />
            <BottomNavigationAction
              label="Manage Translations"
              icon={<TranslateIcon />}
              component={NavLink}
              sx={bottomNavSx}
              to="/manage-translations"
            />
            {/* Doesnt do anything yet, just a placeholder that may or may not make it to the final version */}
            <BottomNavigationAction
              label="Profile"
              icon={<PersonIcon />}
              sx={bottomNavSx}
            />
          </BottomNavigation>
        )}
      </Box>
    </Router>
  );
};

export default App;
