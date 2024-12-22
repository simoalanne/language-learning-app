
import { Button } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const SwapLanguages = ({ selectedLanguages, setSelectedLanguages }) => {
  return (
   <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: "10px", width: "200px" }}
        startIcon={<SwapHorizIcon />}
        onClick={() => setSelectedLanguages([selectedLanguages[1], selectedLanguages[0]])}
      >
        Swap languages
      </Button>
  );
};

export default SwapLanguages;