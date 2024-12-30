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

  const isSmallOrMediumScreen = useMediaQuery("(max-width: 960px)");

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

  // awesome code to set the width of each bottom nav item separately
  const bottomNavSx = (width = "30%") => {
    return {
    "&.active": {
      color: "primary.main",
    },
    "&:hover": {
      color: "primary.main",
    },
    display: "flex",
    flex: `0 0 ${width}`,
    justifyContent: "center",
  };
};

  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallOrMediumScreen ? "column" : "row",
        }}
      >
        {/* Sidebar for larger screens */}
        {!isSmallOrMediumScreen && (
          <Drawer variant="permanent" sx={{ width: 240 }}>
            <Box sx={{ overflow: "auto", mt: 4 }}>
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
                <ListItemButton sx={sideNavSx}>
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
        <Box
          component="main"
          sx={{
            pl: isSmallOrMediumScreen ? 0 : 4,
            pt: 4,
            pb: isSmallOrMediumScreen ? 10 : 2, // space for bottom navigation so it doesn't cover content
            flexGrow: 1, // content area takes up all available space
            display: "flex",
            justifyContent: "center",
            flexDirection: "column", // Stack content vertically for smaller screens
          }}
        >
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
                </>
              }
            />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
        </Box>

        {/* Bottom navigation for smaller screens */}
        {isSmallOrMediumScreen && (
          <BottomNavigation
            sx={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              zIndex: 1000,
              bgcolor: "#f5f5f5",
              display: "flex",
              justifyContent: "space-between",
            }}
            showLabels
          >
            <BottomNavigationAction
              label="Learn"
              icon={<SchoolIcon />}
              component={NavLink}
              sx={bottomNavSx()}
              to="/learn"
            />
            <BottomNavigationAction
              label="Manage Translations"
              icon={<TranslateIcon />}
              component={NavLink}
              sx={bottomNavSx("40%")} // As the text is longer it needs more space to not wrap
              to="/manage-translations"
            />
            {/* Doesnt do anything yet, just a placeholder that may or may not make it to the final version */}
            <BottomNavigationAction
              label="Profile"
              icon={<PersonIcon />}
              sx={bottomNavSx()}
            />
          </BottomNavigation>
        )}
      </Box>
    </Router>
  );
};

export default App;
