import { Snackbar, Alert } from "@mui/material";

const ToastMessage = ({ message, open, setOpen, severity }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      key={"top-center"}
    >
      <Alert
        onClose={() => setOpen(false)}
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
