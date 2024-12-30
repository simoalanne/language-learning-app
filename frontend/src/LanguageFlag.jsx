const LanguageFlag = ({ languageName, style }) => {
  if (!languageName) return null;

  if (!style) {
    style = {width: "24px", height: "24px"}; // if no style is provided just set the width and height to 16px
  }
  return (
    <img
      src={`../public/${languageName}.svg`}
      style={style}
      ></img>
  );
};

export default LanguageFlag;