import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Stack,
	Typography,
} from "@mui/material";
import type { AiGenerationHistoryItem } from "@/types/api";

type PreviousGenerationsTabProps = {
	generations: AiGenerationHistoryItem[];
	loading: boolean;
	onOpenGeneration: (generation: AiGenerationHistoryItem) => void;
};

const formatDateTime = (value: Date) =>
	new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

const PreviousGenerationsTab = ({
	generations,
	loading,
	onOpenGeneration,
}: PreviousGenerationsTabProps) => {
	if (loading) {
		return (
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 4 }}>
				<CircularProgress size={24} />
				<Typography>Loading previous generations...</Typography>
			</Box>
		);
	}

	if (generations.length === 0) {
		return (
			<Alert severity="info" sx={{ mt: 4, maxWidth: 900 }}>
				No previous AI generations yet. Generate a vocabulary list first and it
				will appear here.
			</Alert>
		);
	}

	return (
		<Box
			sx={{
				width: "100%",
				maxWidth: 1100,
				display: "flex",
				flexDirection: "column",
				gap: 2,
				mt: 4,
				px: 2,
			}}
		>
			{generations.map((generation) => (
				<Card key={generation.id} sx={{ borderRadius: 3 }}>
					<CardContent
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							justifyContent: "space-between",
							alignItems: { xs: "flex-start", md: "center" },
							gap: 2,
						}}
					>
						<Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<HistoryIcon fontSize="small" />
								<Typography variant="h6">
									{generation.request.topic || "Untitled topic"}
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
								Created {formatDateTime(generation.createdAt)}
							</Typography>
							<Stack
								direction="row"
								useFlexGap
								spacing={1}
								sx={{ flexWrap: "wrap" }}
							>
								<Chip
									label={`Level: ${generation.request.skillLevel || "Not set"}`}
									size="small"
								/>
								<Chip
									label={`${generation.request.wordCount} words`}
									size="small"
								/>
								<Chip
									label={generation.request.includedLanguages.join(", ")}
									size="small"
								/>
								{generation.request.wordTypes.map((wordType) => (
									<Chip key={wordType} label={wordType} size="small" />
								))}
							</Stack>
						</Box>
						<Button
							variant="contained"
							onClick={() => onOpenGeneration(generation)}
							endIcon={<OpenInNewIcon />}
						>
							Open Generation
						</Button>
					</CardContent>
				</Card>
			))}
		</Box>
	);
};

export default PreviousGenerationsTab;
