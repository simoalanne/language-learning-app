import {
  Dialog,
  DialogContent,
  Box,
  Button,
  Typography,
  Slider,
} from "@mui/material";
import SelectLanguagePair from "./SelectLanguagePair";
import { useContext } from "react";
import { AuthContext } from "./Authorisation/AuthContext";
import SwapLanguagePair from "./SwapLanguagePair";

const TestSettings = ({
  testObject,
  setTestObject,
  onTestStart,
  availableQuestions,
  onAppExit,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Dialog open={testObject.settingsOpen} fullWidth>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4">Test Settings</Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Select the question and answer languages:
          </Typography>
          <SelectLanguagePair
            languageNames={
              isAuthenticated
                ? [
                    "English",
                    "Finnish",
                    "French",
                    "German",
                    "Spanish",
                    "Swedish",
                  ]
                : ["English", "Finnish", "Swedish", "French"]
            }
            selectedLanguages={testObject.selectedLanguages}
            setSelectedLanguages={(languages) =>
              setTestObject((prev) => ({
                ...prev,
                selectedLanguages: languages,
              }))
            }
            labels={["", ""]}
          />
          <SwapLanguagePair
            selectedLanguages={testObject.selectedLanguages}
            setSelectedLanguages={(languages) =>
              setTestObject((prev) => ({
                ...prev,
                selectedLanguages: languages,
              }))
            }
          />
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {`Select the number of questions. Max ${Math.min(
              availableQuestions,
              50
            )} questions available.`}
          </Typography>
          <Slider
            value={testObject.totalQuestions}
            valueLabelDisplay="auto"
            step={1}
            min={1}
            max={Math.min(availableQuestions, 50)}
            onChange={(_, value) =>
              setTestObject((prev) => ({ ...prev, totalQuestions: value }))
            }
          />
          <Button
            variant="contained"
            onClick={onTestStart}
            sx={{ bgcolor: "green" }}
            disabled={availableQuestions === 0}
          >
            Start Test
          </Button>
          <Button variant="contained" onClick={onAppExit} sx={{ bgcolor: "#36454F" }}>
            Back to Mode Selection
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TestSettings;
