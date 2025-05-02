const LanguageFlag = ({ languageName, style }) => {
  if (!languageName) return null;

  if (!style) {
    style = {width: "24px", height: "24px"};
  }
  return (
    <img
      src={`/${languageName}.svg`}
      style={style}
      ></img>
  );
};

export default LanguageFlag;
