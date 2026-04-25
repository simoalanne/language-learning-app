import { Snackbar, Alert } from "@mui/material";

const ToastMessage = ({ message, open, onClose, severity }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      key={"top-center"}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
