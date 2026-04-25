import { Box, Typography } from "@mui/material";
import { type MutableRefObject, useRef, useState } from "react";
import "./Flashcard.css";
import type { WordGroupTranslation } from "@/types/api";

type FlashcardProps = {
	translations: WordGroupTranslation[];
	resetIndexesRef?: MutableRefObject<(() => void) | null>;
};

const Flashcard = ({ translations, resetIndexesRef }: FlashcardProps) => {
	const [flipState, setFlipState] = useState(0);
	const [frontIndex, setFrontIndex] = useState(0);
	const [backIndex, setBackIndex] = useState(0);
	const [index, setIndex] = useState(0);
	const [isFlipping, setIsFlipping] = useState(false);
	const disableTransition = useRef(false);

	if (resetIndexesRef) {
		resetIndexesRef.current = () => {
			disableTransition.current = true;
			setFrontIndex(0);
			setBackIndex(0);
			setIndex(0);
			setFlipState(0);
			setTimeout(() => (disableTransition.current = false), 0);
		};
	}

	const handleFlip = () => {
		if (isFlipping) return;
		setIsFlipping(true);

		const flipDirection = 180;

		if (index === translations.length - 1) {
			const isFrontside = flipState % 360 === 0;

			if (isFrontside) {
				setTimeout(() => {
					setFrontIndex(0);
				}, 300);
				setBackIndex(0);
			} else {
				setTimeout(() => {
					setBackIndex(0);
				}, 300);
				setFrontIndex(0);
			}
			setIndex(0);
			setFlipState((prev) => prev + flipDirection);
			setTimeout(() => {
				setIsFlipping(false);
			}, 600);
			return;
		}

		const isFrontside = flipState % 360 === 0;

		if (isFrontside) {
			setTimeout(() => {
				setFrontIndex((prev) => prev + 1);
			}, 300);
			setBackIndex((prev) => prev + 1);
		} else {
			setTimeout(() => {
				setBackIndex((prev) => prev + 1);
			}, 300);
			setFrontIndex((prev) => prev + 1);
		}

		setFlipState((prev) => prev + flipDirection);
		setIndex((prev) => prev + 1);
		setTimeout(() => {
			setIsFlipping(false);
		}, 600);
	};

	const resolveFlagUrl = (index: number) => {
		const languageName = translations[index].languageName;
		const capitalized =
			languageName.charAt(0).toUpperCase() + languageName.slice(1);
		return `url(${capitalized}.svg)`;
	};

	return (
		<Box sx={{ display: "flex", justifyContent: "center" }}>
			<Box
				className={`card ${isFlipping ? "cardFlipping" : ""}`}
				onClick={handleFlip}
			>
				<div
					className="cardInner"
					style={{
						transform: `rotateY(${flipState}deg)`,
						transition: disableTransition.current ? "none" : "transform 0.6s",
					}}
				>
					<div
						className="cardFront"
						style={{
							backgroundImage: resolveFlagUrl(frontIndex),
						}}
					>
						<Typography variant="h5" className="cardContent">
							{translations[frontIndex].word}
						</Typography>
						<Typography className="cardFooter">
							{`${frontIndex + 1} of ${translations.length}`}
						</Typography>
					</div>
					<div
						className="cardBack"
						style={{
							backgroundImage: resolveFlagUrl(backIndex),
						}}
					>
						<Typography variant="h5" className="cardContent">
							{translations[backIndex].word}
						</Typography>
						<Typography className="cardFooter">
							{`${backIndex + 1} of ${translations.length}`}
						</Typography>
					</div>
				</div>
			</Box>
		</Box>
	);
};

export default Flashcard;
