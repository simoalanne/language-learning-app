import { Button, Box } from "@mui/material";
import { useState } from "react";
import AuthForm from "./AuthForm";

const LogInOrRegisterButtons = () => {
  const [formOpen, setFormOpen] = useState({ open: false, isLogin: true });
  const btnSx = {
    bgcolor: "#2E7D32",
    color: "white",
    borderRadius: 5,
    textTransform: "none",
    fontWeight: "bold",
    fontSize: {xs: "0.8rem", sm: "1rem"},
    py: 1,
    px: 3,
  };

  const handleFormClose = (status) => {
    if (status === "register") {
      setFormOpen({ open: false, isLogin: true });
      setTimeout(() => setFormOpen({ open: true, isLogin: false }), 500);
      return;
    }
    if (status === "login") {
      setFormOpen({ open: false, isLogin: false });
      setTimeout(() => setFormOpen({ open: true, isLogin: true }), 500);
      return;
    }
    setFormOpen({ ...formOpen, open: false });
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          sx={btnSx}
          onClick={() => setFormOpen({ open: true, isLogin: true })}
        >
          Login
        </Button>
        <Button
          variant="contained"
          sx={btnSx}
          onClick={() => setFormOpen({ open: true, isLogin: false })}
        >
          Register
        </Button>
      </Box>
      <AuthForm
        open={formOpen.open}
        handleClose={(status) => handleFormClose(status)}
        isLogin={formOpen.isLogin}
      />
    </>
  );
};

export default LogInOrRegisterButtons;
