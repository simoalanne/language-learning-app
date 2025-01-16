import { Button } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const SwapLanguagePair = ({ selectedLanguages, setSelectedLanguages }) => {
  return (
    <Button
      variant="contained"
      sx={{ bgcolor: "#36454F", color: "white" }}
      startIcon={<SwapHorizIcon />}
      onClick={() =>
        setSelectedLanguages([selectedLanguages[1], selectedLanguages[0]])
      }
    >
      Swap languages
    </Button>
  );
};

export default SwapLanguagePair;
