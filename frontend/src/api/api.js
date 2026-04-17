import axios from "axios";

const createAuthHeaders = async (getToken) => {
  if (!getToken) {
    return {};
  }

  const token = await getToken();

  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};
};

/**
 * Sends a request to get the word groups for the user.
 * If the token is provided, it fetches user-specific word groups.
 * Otherwise, it fetches public word groups that do not require authorization.
 *
 * @param {() => Promise<string | null>} getToken - Clerk token getter. Omit for public word groups.
 * @return {Promise<Object>} The response data containing word groups.
 */
export const getWordGroups = async (getToken) => {
  const response = await axios.get(`/api/word-groups/${getToken ? "users" : "public"}`, {
    headers: await createAuthHeaders(getToken),
  })
  return response.data;
};

/**
 * Sends a reguest to add a new word group to the user's word groups.
 * 
 * @param {Object} wordGroup - The word group data to be added.
 * @param {() => Promise<string | null>} getToken - Clerk token getter.
 * @returns {Promise<Object>} The response data from the server.
 */
export const addWordGroup = async (wordGroup, getToken) => {
  const response = await axios.post("/api/word-groups/users", wordGroup, {
    headers: await createAuthHeaders(getToken),
  });
  return response.data;
}

/**
 * Sends a request to add multiple word groups in bulk to user's word groups.
 * 
 * @param {Array} wordGroups - The array of word group data to be added.
 * @param {() => Promise<string | null>} getToken - Clerk token getter.
 * @returns {Promise<Object>} The response data from the server.
 */
export const addWordGroupsBulk = async (wordGroups, getToken) => {
  const response = await axios.post("/api/word-groups/users/bulk", { bulkData: wordGroups }, {
    headers: await createAuthHeaders(getToken),
  });
  return response.data;
}

/**
 * Sends a request to edit an existing word group.
 * 
 * @param {Object} wordGroup - The updated word group data.
 * @param {number} id - The ID of the word group to be edited.
 * @param {() => Promise<string | null>} getToken - Clerk token getter.
 * @returns {Promise<Object>} The response data from the server.
 */
export const editWordGroup = async (wordGroup, id, getToken) => {
  const response = await axios.put(`/api/word-groups/users/${id}`, wordGroup, {
    headers: await createAuthHeaders(getToken),
  });
  return response.data;
};

/**
 * Sends a request to delete a word group by its ID.
 * 
 * @param {number} id - The ID of the word group to be deleted.
 * @param {() => Promise<string | null>} getToken - Clerk token getter.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteWordGroup = async (id, getToken) => {
  await axios.delete(`/api/word-groups/users/${id}`, {
    headers: await createAuthHeaders(getToken),
  });
}

/**
 * Sends a request to generate words based on the given form data.
 *
 * @param {Object} data - The form data for word generation.
 * @param {() => Promise<string | null>} getToken - Clerk token getter.
 * @returns {Promise<Array>} The generated words.
 */
export const generateWords = async (data, getToken) => {
  console.log("Generating words with data:", data);
  const response = await axios.post(
    "/api/ai/generate-words",
    data,
    {
      headers: await createAuthHeaders(getToken),
    }
  );
  return response.data;
};
