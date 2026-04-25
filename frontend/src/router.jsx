import { Navigate, Route, Routes } from "react-router-dom";
import AiTranslationGeneration from "./features/ai-generation/AiTranslationGeneratation";
import FlashcardMode from "./features/flashcards/FlashcardMode";
import LearnWords from "./features/home/LearnWords";
import ManageTranslations from "./features/word-groups/ManageTranslations";
import MatchingGameMode from "./features/memory-game/MatchingGameMode";
import TestMode from "./features/test-mode/TestMode";

export const AppRouter = ({ isAuthenticated }) => (
	<Routes>
		<Route path="/learn" element={<LearnWords />} />
		<Route
			path="/manage-translations/:tab"
			element={
				isAuthenticated ? <ManageTranslations /> : <Navigate to="/learn" />
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
);
