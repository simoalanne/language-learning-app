import { useState, useEffect } from "react";
import "./App.css";
import AddWordGroupDialog from "./AddWordGroupDialog";
import LearnWords from "./LearnWords";
import DeleteWordGroups from "./DeleteWordGroups";

function App() {
  const [wordGroups, setWordGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [words, setWords] = useState([]);

  const fetchData = async (url, setFunction) => {
    const response = await fetch(`api/${url}`);
    const data = await response.json();
    console.log(data);
    setFunction(data);
  };

  useEffect(() => {
    fetchData("word-groups/", setWordGroups);
    fetchData("languages/", setLanguages);
    fetchData("words/", setWords);
  }, []);

  return (
    <div className="App">
      <h1>Welcome to the learn languages app!</h1>
      <AddWordGroupDialog
        setWordGroups={setWordGroups}
        words={words}
        setWords={setWords}
        languageNames={languages.map((lang) => lang.languageName)}
      />
      <LearnWords
        wordGroups={wordGroups}
        languageNames={languages.map((lang) => lang.languageName)}
      />
      <DeleteWordGroups
        wordGroups={wordGroups}
        setWordGroups={setWordGroups}
        setLanguages={setLanguages}
        setWords={setWords}
      />
    </div>
  );
}

export default App;
