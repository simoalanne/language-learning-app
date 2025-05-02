import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Authorisation/AuthContext";

import { getPublicTopics, getUserTopics } from "../api/api";

const useTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        if (token) {
          console.log("User logged in, fetching user topics");
          const userTopics = await getUserTopics(token);
          setTopics(userTopics);
        } else {
          console.log("User not logged in, fetching public topics");
          const publicTopics = await getPublicTopics();
          setTopics(publicTopics);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [token]);
  return { topics, loading };
}

export default useTopics;
