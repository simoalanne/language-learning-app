import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";

const LearningModeCard = ({ learningModeObj, selectedLearningMode, setSelectedLearningMode }) => {
  const isSelected = selectedLearningMode === learningModeObj.id;
  return (
    <Card
      sx={{
        border: isSelected ? "2px solid #1976d2" : "2px solid #ddd",
        borderRadius: "16px",
        transition: "transform 0.2s, border-color 0.2s",
        '&:hover': {
          transform: "scale(1.05)",
          border: "2px solid #1976d2",
        },
      }}
    >
      <CardActionArea
        onClick={() => setSelectedLearningMode(learningModeObj.id)}
        sx={{
          padding: "16px",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              color: isSelected ? "#1976d2" : "inherit",
              fontWeight: "bold",
            }}
            gutterBottom
          >
            {learningModeObj.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {learningModeObj.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default LearningModeCard;
