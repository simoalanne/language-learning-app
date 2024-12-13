import { useState, useEffect } from "react";
import "./App.css";
import AddWordGroupDialog from "./AddWordGroupDialog";
import LearnWords from "./LearnWords";

function App() {
  const [wordGroups, setWordGroups] = useState([]);
  const devUrl = "http://localhost:3000";

  const fetchData = async (id) => {
    const response = await fetch(`${devUrl}/api/word-groups/${id || ""}`);
    const data = await response.json();
    setWordGroups(data);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div>
      <AddWordGroupDialog setWordGroups={setWordGroups} />
      <LearnWords wordGroups={wordGroups} />
    </div>
  );
}

export default App;
