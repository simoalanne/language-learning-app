import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../Authorisation/AuthContext";

/**
  * Fetches word groups from the server and returns them.
  * @returns {Object} wordgroups - array of word groups
  * @returns {Boolean} loading - loading state
 */
const useWordgroups = () => {
  const [wordgroups, setWordgroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const {token} = useContext(AuthContext);
  useEffect(() => {
    const fetchWordgroups = async () => {
      try {
        const res = await axios.get(`/api/word-groups/${token ? "" : "public/"}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWordgroups(res.data);
      } catch (error) {
        console.error(error.response?.data?.error);
      }
      setLoading(false);
    };
    fetchWordgroups();
  }, [token]);

  return { wordgroups, loading, setWordgroups };
};

export default useWordgroups;