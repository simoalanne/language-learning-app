import type { CSSProperties } from "react";

type LanguageFlagProps = {
	languageName?: string | null;
	style?: CSSProperties;
};

const LanguageFlag = ({ languageName, style }: LanguageFlagProps) => {
	if (!languageName) return null;

	if (!style) {
		style = { width: "24px", height: "24px" }; // if no style is provided just set the width and height to 16px
	}
	return (
		<img
			src={`/${languageName}.svg`}
			style={style}
			alt={`${languageName} flag`}
		/>
	);
};

export default LanguageFlag;
