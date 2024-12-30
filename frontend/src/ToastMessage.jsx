import { Snackbar } from "@mui/material";

const ToastMessage = ({ message, isOpen, setOpen }) => {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={5000}
      onClose={() => setOpen(false)}
      message={message}
    />
  );
};

export default ToastMessage;
