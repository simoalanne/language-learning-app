import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Typography } from "@mui/material";

const MoveIcons = ({
  currentIndex,
  maxIndex,
  onClick,
  alternativeIcons = false,
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, width: "100%" }}>
      {!alternativeIcons && (
        <>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => onClick(0)}
              disabled={currentIndex === 0}
            >
              <FirstPageIcon />
            </IconButton>
            <IconButton
              onClick={() => onClick(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" sx={{ margin: "auto 0", fontWeight: "bold" }}>
            {currentIndex + 1} / {maxIndex + 1}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => onClick(currentIndex + 1)}
              disabled={currentIndex === maxIndex}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <IconButton
              onClick={() => onClick(maxIndex)}
              disabled={currentIndex === maxIndex}
            >
              <LastPageIcon />
            </IconButton>
          </Box>
        </>
      )}
      {alternativeIcons && (
        <>
          <IconButton
            onClick={() => onClick(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ArrowBackIcon fontSize="large" color={currentIndex === 0 ? "disabled" : "primary"} />
          </IconButton>
          <Typography variant="h5" sx={{ margin: "auto 0", fontWeight: "bold" }}>
            {currentIndex + 1} / {maxIndex + 1}
          </Typography>
          <IconButton
            onClick={() => onClick(currentIndex + 1)}
            disabled={currentIndex === maxIndex}
          >
            <ArrowForwardIcon fontSize="large" color={currentIndex === maxIndex ? "disabled" : "primary"} />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default MoveIcons;
