/* eslint react/prop-types: 0 */
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import axios from "axios";

const DeleteWordGroups = ({ wordGroups, setWordGroups, setLanguages, setWords }) => {
  const [open, setOpen] = useState(false);

  // Delete everything
  // TODO: allow selective deletion
  const handleDelete = async () => {
    await axios.delete("/api/word-groups");
    setWordGroups([]);
    setLanguages([]);
    setWords([]);
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        sx={{ backgroundColor: "orange" }}
        onClick={() => setOpen(true)}
      >
        Delete all word groups
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete all word groups</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all word groups?
          </DialogContentText>
          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: "red", margin: "10px 0" }}
            disabled={!wordGroups || wordGroups.length === 0}
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
          >
            Delete all word groups
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpen(false)}
          >
            Cancel and exit
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleteWordGroups;
