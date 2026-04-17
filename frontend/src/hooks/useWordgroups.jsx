import { useState, useEffect } from "react";

import { useAppAuth } from "../Authorisation/useAppAuth";
import { getWordGroups } from "../api/api";

const normalizeLanguageName = (languageName) => {
  if (typeof languageName !== "string" || languageName.length === 0) {
    return languageName;
  }

  return languageName.charAt(0).toUpperCase() + languageName.slice(1).toLowerCase();
};

const normalizeWordGroup = (group) => ({
  ...group,
  translations: Array.isArray(group?.translations)
    ? group.translations.map((translation) => ({
      ...translation,
      languageName: normalizeLanguageName(translation?.languageName),
      synonyms: Array.isArray(translation?.synonyms) ? translation.synonyms : [],
    }))
    : [],
  tags: Array.isArray(group?.tags) ? group.tags : [],
});

/**
  * Fetches word groups from the server and returns them.
  * @returns {Object} wordgroups - array of word groups
  * @returns {Boolean} loading - loading state
 */
const useWordgroups = () => {
  const [wordgroups, setWordgroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isAuthenticated, isLoaded } = useAppAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const fetchWordgroups = async () => {
      setLoading(true);
      try {
        const groups = await getWordGroups(isAuthenticated ? getToken : undefined);
        setWordgroups(groups.map(normalizeWordGroup));
      } catch (error) {
        console.error(error.response?.data?.error);
      }
      setLoading(false);
    };
    fetchWordgroups();
  }, [getToken, isAuthenticated, isLoaded]);

  return { wordgroups, loading, setWordgroups };
};

export default useWordgroups;
