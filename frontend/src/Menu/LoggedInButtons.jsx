import { Button, Box, Menu, MenuItem } from "@mui/material";
import { useContext, useState } from "react";
import { AuthContext } from "../Authorisation/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const LoggedInButtons = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        size="large"
        sx={{
          bgcolor: "#1976D2",
          color: "white",
          borderRadius: 5,
          textTransform: "none",
          fontWeight: "bold",
          px: 2,
        }}
        onClick={handleClick}
      >
        {user.username}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            navigate(
              `${location.pathname === "/learn"
                ? "/manage-translations/add"
                : "/learn"
              }`
            );
            handleClose();
          }}
          sx={{
            fontWeight: "bold",
          }}
        >
          {location.pathname === "/learn"
            ? "Manage Translations"
            : "Learn Words"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/ai-translation-generation");
            handleClose();
          }}
          sx={{
            fontWeight: "bold",
          }}
        >
          Generate Translations with AI
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (location.pathname !== "/learn") {
              navigate("/learn");
            }
            logout();
            handleClose();
          }}
          sx={{
            fontWeight: "bold",
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LoggedInButtons;
