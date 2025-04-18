import axios from "axios";

/**
 * Sends a request to generate words based on the given form data.
 *
 * @param {Object} data - The form data for word generation.
 * @param {string} token - The auth token for the request.
 * @returns {Promise<Array>} The generated words.
 */
export const generateWords = async (data, token) => {
  console.log("Generating words with data:", data);
  const response = await axios.post(
    "/api/ai/generate-words",
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Sends a bulk save request for the provided word items.
 *
 * @param {Array} bulkData - The words to save.
 * @param {string} token - The auth token for the request.
 * @returns {Promise<void>}
 */
export const saveWordsBulk = async (bulkData, token) => {
  console.log("Saving words in bulk:", bulkData);
  await axios.post(
    "/api/word-groups/bulk",
    { bulkData },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
