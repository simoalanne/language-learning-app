import { useState, useEffect } from "react";
import "./App.css";
import AddWordGroupDialog from "./AddWordGroupDialog";

function App() {
  const [wordGroups, setWordGroups] = useState([]);
  const devUrl = "http://localhost:3000";

  const fetchData = async (id) => {
    const response = await fetch(`${devUrl}/api/word-groups/${id || ""}`);
    const data = await response.json();
    setWordGroups([data]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>App is ready now for sure</h1>
      <p>{JSON.stringify(wordGroups)}</p>
      <AddWordGroupDialog setWordGroups={setWordGroups} />
    </div>
  );
}

export default App;
