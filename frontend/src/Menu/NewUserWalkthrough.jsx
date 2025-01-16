import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../Authorisation/AuthContext";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  MenuItem,
  Menu,
} from "@mui/material";
import axios from "axios";
import WordGroupItem from "./WordGroupItem";

const NewUserWalkthrough = ({setWordGroups}) => {
  const { user, token, firstLogin, setFirstLogin } = useContext(AuthContext);
  const [disableButton, setDisableButton] = useState(false);
  const [publicGroups, setPublicGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const handleCopyPublicGroups = async () => {
    setDisableButton(true);
    try {
      await axios.post(
        "/api/word-groups/bulk",
        { bulkData: selectedGroups },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Groups copied successfully!");
      setWordGroups(selectedGroups);
    } catch (error) {
      console.error(error.response?.data?.error);
      setError("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (!firstLogin) return;
    const fetchPublicGroups = async () => {
      try {
        const res = await axios.get("/api/word-groups/public");
        setPublicGroups(res.data);
      } catch (error) {
        console.error(error.response?.data?.error);
      }
    };
    fetchPublicGroups();
  }, [firstLogin]);

  const handleClose = () => {
    setFirstLogin(false);
    setPublicGroups([]);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroups((prevSelectedGroups) =>
      prevSelectedGroups.includes(group)
        ? prevSelectedGroups.filter((g) => g !== group)
        : [...prevSelectedGroups, group]
    );
  };

  if (!user) return null;

  return (
    <Dialog open={firstLogin} onClose={() => setFirstLogin(false)}>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          {`Welcome ${user.username}!`}
        </Typography>
        <Typography
          variant="body1"
          sx={{ marginBottom: 3, textAlign: "center" }}
        >
          Thanks for signing up! You have now unlocked access to creating your
          own translations. To help you get started, you can copy some public
          translations to your account. They can freely modified or deleted
          later.
        </Typography>

        <Box sx={{ marginBottom: 2 }}>
          <Button
            variant="contained"
            onClick={handleMenuClick}
            disabled={disableButton}
            sx={{
              marginBottom: 2,
            }}
          >
            Choose Groups to Copy
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            {`Selected groups: ${selectedGroups.length} / ${publicGroups.length}`}
          </Typography>
          {success && (
            <Typography
              variant="body2"
              sx={{ color: "green", textAlign: "center" }}
            >
              {success}
            </Typography>
          )}
          {error && (
            <Typography
              variant="body2"
              sx={{ color: "red", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Box
              key={0}
              sx={{
                position: "sticky",
                top: 0,
                p: 1,
                bgcolor: "#F0F0F0",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                {`Selected groups: ${selectedGroups.length} / ${publicGroups.length}`}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "black",
                  }}
                  onClick={() => setSelectedGroups([])}
                >
                  Clear All
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setSelectedGroups(publicGroups)}
                >
                  Select All
                </Button>
              </Box>
            </Box>
            {publicGroups.map((group, i) => (
              <div key={i}>
                <Typography
                  sx={{
                    p: 1,
                    fontWeight: "bold",
                    textAlign: "center",
                    bgcolor: i % 20 === 0 ? "#388E3C" : "white",
                  }}
                  variant="h5"
                >
                  {i % 20 === 0 && group.tags[0]}
                </Typography>
                <MenuItem
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                >
                  <WordGroupItem
                    key={group.id}
                    wordGroup={group}
                    selected={selectedGroups}
                    onSelect={() => handleGroupSelect(group)}
                  />
                </MenuItem>
              </div>
            ))}
          </Menu>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            disabled={disableButton || selectedGroups.length === 0}
            onClick={handleCopyPublicGroups}
            sx={{ bgcolor: "#2E7D32", display: "flex", flex: 1 }}
          >
            Copy Selected
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#36454F", display: "flex", flex: 1 }}
            onClick={handleClose}
          >
            {disableButton ? "Exit" : "Skip"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserWalkthrough;
