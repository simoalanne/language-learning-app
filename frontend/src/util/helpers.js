/**
 * Shuffles array with Fisher-Yates algorithm
 * @param {Array} array - array to shuffle
 * @returns {Array} - shuffled array
 */
export const shuffle = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};
