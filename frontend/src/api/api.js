import axios from "axios";

/**
 * Sends a request to the server to log in or register a user.
 * They should be seperate ideally, but for the sake of simplicity, they are combined.
 * 
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @param {boolean} isLogin - Indicates whether to log in or register.
 * @return {Promise<Object>} The response data from the server.
 */
export const loginOrRegister = async (username, password, isLogin) => {
  const res = await axios.post(
    `/api/auth/${isLogin ? "login" : "register"}`,
    {
      username,
      password,
    }
  );
  return res.data;
}

/**
 * Sends a request to the server to see if the users token is valid.
 * 
 * @returns {Promise<Object>} The response data from the server.
 */
export const verifyToken = async (token) => {
  const response = await axios.get("/api/auth/verify-token", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data
};

/**
 * Sends a request to get the word groups for the user.
 * If the token is provided, it fetches user-specific word groups.
 * Otherwise, it fetches public word groups that do not require authorization.
 *
 * @param {string} token - The auth token for the request. dont pass if you want public word groups.
 * @return {Promise<Object>} The response data containing word groups.
 */
export const getWordGroups = async (token) => {
  const response = await axios.get(`/api/word-groups/${token ? "users" : "public"}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data;
};

/**
 * Sends a reguest to add a new word group to the user's word groups.
 * 
 * @param {Object} wordGroup - The word group data to be added.
 * @param {string} token - The auth token for the request.
 * @returns {Promise<Object>} The response data from the server.
 */
export const addWordGroup = async (wordGroup, token) => {
  const response = await axios.post("/api/word-groups/users", wordGroup, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Sends a request to add multiple word groups in bulk to user's word groups.
 * 
 * @param {Array} wordGroups - The array of word group data to be added.
 * @param {string} token - The auth token for the request.
 * @returns {Promise<Object>} The response data from the server.
 */
export const addWordGroupsBulk = async (wordGroups, token) => {
  const response = await axios.post("/api/word-groups/users/bulk", { bulkData: wordGroups }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Sends a request to edit an existing word group.
 * 
 * @param {Object} wordGroup - The updated word group data.
 * @param {number} id - The ID of the word group to be edited.
 * @param {string} token - The auth token for the request.
 * @returns {Promise<Object>} The response data from the server.
 */
export const editWordGroup = async (wordGroup, id, token) => {
  const response = await axios.put(`/api/word-groups/users/${id}`, wordGroup, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Sends a request to delete a word group by its ID.
 * 
 * @param {number} id - The ID of the word group to be deleted.
 * @param {string} token - The auth token for the request.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteWordGroup = async (id, token) => {
  await axios.delete(`/api/word-groups/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

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
