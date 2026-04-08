import { useState } from "react";

export default function Recommend() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  const getRecommendations = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: input }),
    });

    const data = await res.json();
    setResults(data.recommendations);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>StudyFlare AI 🚀</h1>

      <input
        type="text"
        placeholder="Enter topic..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      <button onClick={getRecommendations} style={{ marginLeft: "10px" }}>
        Get Recommendations
      </button>

      <ul>
        {results.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
