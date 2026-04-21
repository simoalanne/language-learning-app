import { AppBar, Box, CssBaseline, Typography } from "@mui/material";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import AiTranslationGeneration from "./AiTranslationGeneratation";
import { useAppAuth } from "./Authorisation/useAppAuth";
import { ApiClientProvider } from "./api/api";
import FlashcardMode from "./FlashcardMode";
import LearnWords from "./LearnWords";
import ManageTranslations from "./ManageTranslations";
import MatchingGameMode from "./MatchingGameMode";
import LoggedInButtons from "./Menu/LoggedInButtons";
import LogInOrRegisterButtons from "./Menu/LogInOrRegisterButtons";
import TestMode from "./TestMode";

const App = () => {
	const { isAuthenticated, isLoaded } = useAppAuth();

	if (!isLoaded) {
		return null;
	}

	return (
		<Router>
			<ApiClientProvider>
				<CssBaseline />
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						minHeight: "100vh",
					}}
				>
					<AppBar
						position="static"
						sx={{ background: "linear-gradient(to right, #D1C4E9, #B3E5FC)" }}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								py: 1,
								mx: 1.5,
							}}
						>
							<Typography
								fontFamily="Impact, sans-serif"
								sx={{ fontSize: { xs: "1.25rem", sm: "2rem" } }}
							>
								Language App
							</Typography>
							{isAuthenticated ? (
								<LoggedInButtons />
							) : (
								<LogInOrRegisterButtons />
							)}
						</Box>
					</AppBar>
					<Box component="main" sx={{ display: "flex", flexGrow: 1 }}>
						<Routes>
							<Route path="/learn" element={<LearnWords />} />
							<Route
								path="/manage-translations/:tab"
								element={
									isAuthenticated ? (
										<ManageTranslations />
									) : (
										<Navigate to="/learn" />
									)
								}
							/>
							<Route
								path="/ai-translation-generation"
								element={
									isAuthenticated ? (
										<AiTranslationGeneration />
									) : (
										<Navigate to="/learn" />
									)
								}
							/>
							<Route path="/flashcards" element={<FlashcardMode />} />
							<Route path="/matching-game" element={<MatchingGameMode />} />
							<Route path="/test" element={<TestMode />} />
							<Route path="*" element={<Navigate to="/learn" />} />
						</Routes>
					</Box>
				</Box>
			</ApiClientProvider>
		</Router>
	);
};

export default App;
