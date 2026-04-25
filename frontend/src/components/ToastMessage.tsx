import { Alert, Snackbar } from "@mui/material";
import type { AlertColor, SnackbarCloseReason } from "@mui/material";
import type { SyntheticEvent } from "react";

type ToastMessageProps = {
  message: string;
  open: boolean;
  onClose: (
    event?: Event | SyntheticEvent<unknown>,
    reason?: SnackbarCloseReason,
  ) => void;
  severity: AlertColor;
};

const ToastMessage = ({
  message,
  open,
  onClose,
  severity,
}: ToastMessageProps) => {
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
