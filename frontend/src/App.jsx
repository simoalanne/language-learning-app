import { useState, useEffect } from "react";
import "./App.css";
import AddWordGroupDialog from "./AddWordGroupDialog";
import LearnWords from "./LearnWords";

function App() {
  const [wordGroups, setWordGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [words, setWords] = useState([]);

  const fetchData = async (url, setFunction) => {
    const baseUrl = "http://localhost:3000/api";
    const response = await fetch(`${baseUrl}/${url}`);
    const data = await response.json();
    console.log(data);
    setFunction(data);
  };

  useEffect(() => {
    fetchData("word-groups/", setWordGroups);
    fetchData("languages", setLanguages);
    fetchData("words", setWords);
  }, []);

  return (
    <div>
      <AddWordGroupDialog
        setWordGroups={setWordGroups}
        words={words}
        setWords={setWords}
        languageNames={languages.map((lang) => lang.languageName)}
      />
      <LearnWords wordGroups={wordGroups} />
    </div>
  );
}

export default App;
