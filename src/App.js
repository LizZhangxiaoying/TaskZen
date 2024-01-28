import "./style.css";
import supabase from "./supabase";
import { useEffect, useState } from "react";
import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { red } from "@mui/material/colors";
import AppBarSection from "./topBar";

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "Assignments",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "Life-management",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "Self-care",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function ColorButtons() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" color="success">
        Completed
      </Button>
    </Stack>
  );
}

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span style={{ fontSize: "40px" }}>{count}</span>
      <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

function App() {
  //1.Define state variable
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory != "all")
          query = query.eq("category", currentCategory);

        const { data: facts, error } = await query

          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert("There was a problem getting data");
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <AppBarSection />
      {/* HEADER */}
      <Header showForm={showForm} setShowForm={setShowForm} />
      {/* use state variable */}
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "My Little Task Hub";

  return (
    <header className="header">
      <div className="logo">
        <img
          src="task4.png"
          height="200"
          width="200"
          alt="Today I learned logo"
        />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        //2.update state variable
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Create a task"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "Assignments", color: "#3b82f6" },
  { name: "Office Hours", color: "#16a34a" },
  { name: "Networking", color: "#ef4444" },
  { name: "Professional Development", color: "#eab308" },
  { name: "School activities", color: "#db2777" },
  { name: "Entertainment", color: "#14b8a6" },
  { name: "Self-care", color: "#f97316" },
  { name: "Life-management", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    //1.provent browswer reload
    e.preventDefault();
    console.log(text, source, category);
    //2.Chekc if data is valid. If so, create a new fact
    if (text && category && textLength <= 200) {
      //3.create a new fact Object
      // const newFact = {
      //   id: Math.round(Math.random() * 1000000),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      // 3.Upload object to Supabase  and receive the new
      //fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      //4.Add the new fact to the UI: Add the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      //5.Reset the input field to empty
      setText("");
      setSource("");
      setCategory("");
      //6.Create the form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Today I need to finish..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - text.length}</span>
      <input
        value={source}
        type="text"
        placeholder="Link/Side note"
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose a category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className="message">
        All tasks finished for this category! Good job 🤟
      </p>
    );

  return (
    <section>
      {" "}
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFact, setShowFact] = useState(true);

  function handleDelete() {
    console.log("111");
  }

  async function handleDelete() {
    try {
      setIsUpdating(true);

      if (!fact) {
        console.error("Fact object is null or undefined");
        return;
      }

      // Delete the fact from Supabase
      const { error } = await supabase.from("facts").delete().eq("id", fact.id);

      setIsUpdating(false);

      console.log("Deletion Error:", error);

      if (!error) {
        // Update the UI by removing the deleted fact
        setFacts((facts) => facts.filter((f) => f.id !== fact.id));
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  }

  async function handleVote() {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ ["votesInteresting"]: fact["votesInteresting"] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);
    console.log(updatedFact);
    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact" key={fact.id}>
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          {isValidHttpUrl(fact.source)
            ? "link"
            : fact.source
            ? `(${fact.source})`
            : null}
        </a>
      </p>

      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            ?.color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={handleVote} disabled={isUpdating}>
          👍 {fact.votesInteresting}
        </button>
        <button className="delete-buttons" onClick={handleDelete}>
          ⛔️Delete
        </button>
      </div>
    </li>
  );
}

export default App;
