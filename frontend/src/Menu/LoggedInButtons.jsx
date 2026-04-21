import { Button, Box, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppAuth } from "../Authorisation/useAppAuth";

const LoggedInButtons = () => {
  const { displayName, signOut } = useAppAuth();
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
        {displayName}
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
            signOut();
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
