import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

type ContentAlignerProps = {
  children: ReactNode;
  gap?: number | string;
  centerVertically?: boolean;
  background?: string;
  bgcolor?: string;
  sx?: SxProps<Theme>;
};

const ContentAligner = ({
  children,
  gap,
  centerVertically = true,
  background,
  bgcolor,
  sx,
}: ContentAlignerProps) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      alignItems: "center",
      justifyContent: centerVertically ? "center" : "flex-start",
      gap: gap || 0,
      background,
      bgcolor,
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default ContentAligner;
