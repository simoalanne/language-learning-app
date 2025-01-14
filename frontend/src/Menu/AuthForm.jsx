import { useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Close from "@mui/icons-material/Close";
import axios from "axios";
import { AuthContext } from "../Authorisation/AuthContext";

const AuthForm = ({ open, handleClose, isLogin = true }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const { login } = useContext(AuthContext);
  const userNameRegex = /^[a-zA-Z0-9_]+$/;
  const handleSubmit = async () => {
    if (isLogin) {
      handleSignInOrRegister();
      return;
    }
    let err = false;
    if (
      username.length < 2 ||
      username.length > 24 ||
      !userNameRegex.test(username)
    ) {
      setUserNameError(true);
      err = true;
    }
    if (password.length < 8 || password.length > 64) {
      setPasswordError(true);
      err = true;
    }
    if (err) return;

    handleSignInOrRegister();
  };

  const handleSignInOrRegister = async () => {
    try {
      const res = await axios.post(
        `/api/auth/${isLogin ? "login" : "register"}`,
        {
          username,
          password,
        }
      );
      if (res.data?.token) {
        const firstLogin = !isLogin;
        // pass firstLogin as true if user is registering
        // this will trigger the NewUserWalkthrough component.
        login(res.data.token, firstLogin);
        onClose();
        return;
      }
    } catch (e) {
      console.error(e.response.data);
      setCredentialsError("Invalid username or password");
    }
  };

  const onClose = (status) => {
    setUsername("");
    setPassword("");
    setUserNameError(false);
    setPasswordError(false);
    setCredentialsError("");
    handleClose(status);
  };

  const handleUserNameChange = (value) => {
    setCredentialsError("");
    setUsername(value);
    if (value.length === 0) setUserNameError(false);
    if (value.length >= 3) setUserNameError(false);
  };

  const handlePasswordChange = (value) => {
    setCredentialsError("");
    setPassword(value);
    if (value.length === 0) setPasswordError(false);
    if (value.length >= 8) setPasswordError(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.05)",
              color: "black",
              "&:hover": { bgcolor: "rgba(0,0,0,0.2)" },
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Typography variant="h5" align="center" sx={{ my: 3, fontWeight: 600 }}>
          {isLogin ? "Sign in" : "Create your account"}
        </Typography>
        {credentialsError && (
          <Box sx={{ bgcolor: "rgba(255,0,0,0.1)", p: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ color: "red", ml: 1 }}>
              {credentialsError}
            </Typography>
          </Box>
        )}
        <TextField
          autoComplete="off"
          autoFocus
          label="Username"
          type="text"
          fullWidth
          value={username}
          onChange={(e) => handleUserNameChange(e.target.value)}
          sx={{ mb: 2 }}
          error={userNameError}
          helperText={
            userNameError
              ? "Username must be between 2 to 25 characters long and contain only letters, numbers, and underscores"
              : ""
          }
        />
        <TextField
          sx={{ mb: 4 }}
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={passwordError}
          helperText={
            passwordError
              ? "Password must be between 8 and 50 characters long"
              : ""
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #000005, #434343)", "&:disabled": { background: "rgba(0,0,0,0.5)" },
            color: "white",
            mb: 2,
          }}
          fullWidth
          onClick={handleSubmit}
          disabled={!username || !password}
        >
          {isLogin ? "Sign in" : "Sign up"}
        </Button>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ display: "inline" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Typography>
          <Link
            sx={{ color: "#1976d2", fontWeight: 750, cursor: "pointer" }}
            onClick={() => {
              onClose(isLogin ? "register" : "login");
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthForm;
