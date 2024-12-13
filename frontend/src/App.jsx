import { useState, useEffect } from "react"
import "./App.css"
import axios from 'axios'

function App() {
  const [wordGroups, setWordGroups] = useState("")
  const devUrl = "http://localhost:3000"

  const addData = async (wordGroupObj) => {
    console.log("addData", wordGroupObj)
    await axios.post(`${devUrl}/api/word-groups`, wordGroupObj)
  }
  
  const fetchData = async (id) => {
    const response = await fetch(`${devUrl}/api/word-groups/${id}`)
    const data = await response.json()
    setWordGroups(data)
  };

  useEffect(() => {
    const wordGroupObj = {
      "translations": [
        { languageName: "English", word: "it works", synonyms: ["it functions"] },
        { languageName: "Spanish", word: "funciona", synonyms: ["trabaja"] },
        { languageName: "Finnish", word: "se toimii", synonyms: ["se toimii"] }
      ],
      tags: ["expressions"],
      difficulty: 1
    }
    addData(wordGroupObj).then(() => fetchData(1))
  }, []);

  return (
    <div>
    <h1>App is ready now for sure</h1>
    <p>{JSON.stringify(wordGroups)}</p>
    </div>
  );
};

export default App
