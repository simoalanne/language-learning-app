import { Box, Typography } from "@mui/material";

const MatchingGameCard = ({
  backsideContent,
  index,
  handleClick,
  isFlipped,
  cardScale,
}) => {
  const fontSize =
    backsideContent.length > 25
      ? 0.75 * cardScale + "rem"
      : 1 * cardScale + "rem";
  return (
    <Box
      onClick={() => !isFlipped && handleClick(index)}
      sx={{
        width: 75 * cardScale,
        height: 75 * cardScale,
        perspective: 1000,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          "&:hover": {
            cursor: "pointer",
          },
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #8A2BE2, #FF69B4)",
            boxShadow: "inset 0 0 50px rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography sx={{ fontSize: 2 * cardScale + "rem" }}>⭐</Typography>
        </Box>
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#e0e0e0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Typography
            sx={{
              width: 75 * cardScale,
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
              wordWrap: "break-word",
              maxHeight: 75,
              display: "block",
              lineHeight: "normal",
              fontSize: fontSize,
            }}
          >
            {backsideContent}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MatchingGameCard;
