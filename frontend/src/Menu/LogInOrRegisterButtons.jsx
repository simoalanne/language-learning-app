import { Button, Box } from "@mui/material";
import { SignInButton, SignUpButton } from "@clerk/react";

const LogInOrRegisterButtons = () => {
  const btnSx = {
    bgcolor: "#2E7D32",
    color: "white",
    textTransform: "none",
    fontWeight: "bold",
    fontSize: {xs: "0.8rem", sm: "1rem"},
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <SignInButton mode="modal">
        <Button
          variant="contained"
          sx={btnSx}
        >
          Login
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button
          variant="contained"
          sx={btnSx}
        >
          Register
        </Button>
      </SignUpButton>
    </Box>
  );
};

export default LogInOrRegisterButtons;
