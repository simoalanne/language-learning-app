import { AppBar, Box, CssBaseline, Typography } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import LoggedInButtons from "./features/home/LoggedInButtons";
import LogInOrRegisterButtons from "./features/home/LogInOrRegisterButtons";
import { useAppAuth } from "./providers/use-app-auth";
import { AppRouter } from "./router";

const App = () => {
	const { isAuthenticated, isLoaded } = useAppAuth();

	if (!isLoaded) {
		return null;
	}

	return (
		<Router>
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
							sx={{
								fontFamily: "Impact, sans-serif",
								fontSize: { xs: "1.25rem", sm: "2rem" },
							}}
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
					<AppRouter isAuthenticated={isAuthenticated} />
				</Box>
			</Box>
		</Router>
	);
};

export default App;
