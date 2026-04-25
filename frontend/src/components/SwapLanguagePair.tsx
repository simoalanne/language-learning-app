import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Button } from "@mui/material";

type SwapLanguagePairProps = {
	selectedLanguages: [string, string];
	setSelectedLanguages: (languages: [string, string]) => void;
};

const SwapLanguagePair = ({
	selectedLanguages,
	setSelectedLanguages,
}: SwapLanguagePairProps) => {
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
