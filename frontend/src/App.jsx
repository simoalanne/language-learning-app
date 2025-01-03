import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
} from "react-router-dom";
import {
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
import ManageTranslations from "./ManageTranslations";
import LearnWords from "./LearnWords";

const App = () => {
  const [wordGroups, setWordGroups] = useState([]);
  const [languages, setLanguages] = useState([]);

  const fetchData = async (url, setFunction) => {
    const response = await fetch(`/api/${url}`);
    const data = await response.json();
    setFunction(data);
  };

  useEffect(() => {
    fetchData("word-groups/", setWordGroups);
    fetchData("languages/", setLanguages);
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

  const bottomNavSx = (width = "25%") => {
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
                <CustomNavLink
                  to="/manage-translations/add"
                  label="Manage Translations"
                  icon={<TranslateIcon />}
                  sx={sideNavSx}
                  rootPath="/manage-translations"
                />
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
              path="/manage-translations/:tab"
              element={
                <ManageTranslations
                  setWordGroups={setWordGroups}
                  languageNames={languages.map((lang) => lang.languageName)}
                  wordGroups={wordGroups}
                />
              }
            />
            <Route path="*" element={<Navigate to="/learn" />} />
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
            <CustomBottomNavLink
              to="/manage-translations/add"
              label="Manage Translations"
              icon={<TranslateIcon />}
              sx={bottomNavSx("50%")}
              rootPath="/manage-translations"
            />
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

// Custom Bottom Navigation Link for 'Manage Translations'
const CustomBottomNavLink = ({ to, label, icon, sx, rootPath }) => {
  const location = useLocation();

  // Check if the route is active based on rootPath
  const isActive = location.pathname.includes(rootPath);

  return (
    <BottomNavigationAction
      label={label} // Ensure label is always visible
      icon={icon} // Always show the icon
      component={NavLink}
      to={to}
      sx={{
        ...sx,
        ...(isActive && {
          color: "primary.main", // When active, color becomes primary
        }),
        // label disappears for whatever reason so it needs to be overridden to be visible
        "& .MuiBottomNavigationAction-label": {
          opacity: 1,
        },
        padding: 0,
      }}
    />
  );
};


// when a url contains params, then the active class is not applied to the NavLink
// because navlink by default only checks for exact matches
const CustomNavLink = ({ to, label, icon, sx, rootPath }) => {
  const location = useLocation();

  const isActive = location.pathname.includes(rootPath);
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      sx={{
        ...sx,
        ...(isActive && {
          color: "primary.main",
          backgroundColor: "rgba(0, 0, 0, 0.05)",          
        }),
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

export default App;
