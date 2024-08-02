import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

const FACULTIES = [
  { facs: "Economic and Management Sciences", color: "#f97316" },
  { facs: "Education", color: "#0284c7" },
  { facs: "Engineering", color: "#6b7280" },
  { facs: "Health Sciences", color: "#db2777" },
  { facs: "Humanities", color: "#facc15" },
  { facs: "Law", color: "#dc2626" },
  { facs: "Natural and Agricultural Sciences", color: "#16a34a" },
  { facs: "Theology", color: "#f0abfc" },
];

// const initialLessons = [
//   {
//     id: 1,
//     lesson: "empty",
//     link: "www.google.co.za",
//     faculty: "Law",
//     voteThumbsUp: 1,
//     voteMindBlown: 0,
//     voteWrong: 0,
//   },
// ];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState("*");

  useEffect(
    function () {
      async function getLessons() {
        setIsLoading(true);

        let query = supabase.from("LessonsTable").select("*");

        if (currentFaculty !== "*") {
          query = query.eq("faculty", currentFaculty);
        }

        const { data: lessons, error } = await query
          .order("created_at", { ascending: false })
          .limit(1000);

        if (!error) {
          setLessons(lessons);
        } else {
          alert("Failed to load database!");
        }

        setIsLoading(false);
      }
      getLessons();
    },
    [currentFaculty]
  );

  return (
    <>
      <Header showFormProp={showForm} setShowFormProp={setShowForm} />

      {showForm ? (
        <NewLessonForm
          setLessonsProp={setLessons}
          setShowFormProp={setShowForm}
        />
      ) : null}

      <main className="main">
        <FacultyFilters setCurrentFacultyProp={setCurrentFaculty} />
        {isLoading ? (
          <Loader />
        ) : (
          <LessonList lessons={lessons} setLessons={setLessons} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showFormProp, setShowFormProp }) {
  const appTitle = "Share a lesson";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowFormProp((show) => !show)}
      >
        {showFormProp ? "Close" : "Share New Lesson"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewLessonForm({ setLessons, setShowFormProp }) {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [faculty, setFaculty] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // 1. Prevent browser reload
    e.preventDefault();

    // 2. Check if data is valid. If so, create a new lesson
    if (text && isValidHttpUrl(link) && faculty && textLength <= 200) {
      // 3. Create a new lesson object
      // const newLesson = {
      //   id: 1,
      //   lessonText,
      //   link,
      //   faculty,
      //   voteThumbsUp: 0,
      //   voteMindBlown: 0,
      //   voteWrong: 0,
      //   //createdAt: new Date().getCurrentYear(),
      // };

      // 3. Uplaod lesson to Supabase and receive the new lesson object
      setIsUploading(true);
      const { data: newLesson, error } = await supabase
        .from("LessonsTable")
        .insert([{ text, link, faculty }])
        .select();
      setIsUploading(false);

      // 4. Add the new lesson to the UI: add the lesson to the state
      if (!error) {
        setLessons((lessons) => [newLesson[0], ...lessons]);
      }

      // 5. Reset input fields
      setText("");
      setLink("");
      setFaculty("");

      // 6. CLose the form
      setShowFormProp(false);
    }
  }

  return (
    <form className="lesson-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a lesson with the campus..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={link}
        onChange={(e) => setLink(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={faculty}
        onChange={(e) => setFaculty(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose Faculty:</option>
        {FACULTIES.map((fac) => (
          <option key={fac.facs} value={fac.facs}>
            {fac.facs.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function FacultyFilters({ setCurrentFacultyProp }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentFacultyProp("*")}
          >
            All
          </button>
        </li>

        {FACULTIES.map((fac) => (
          <li key={fac.facs} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: fac.color }}
              onClick={() => setCurrentFacultyProp(fac.facs)}
            >
              {fac.facs}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function LessonList({ lessons, setLessons }) {
  if (lessons.length === 0) {
    return (
      <p className="message">
        Be the first person to post a lesson you learnt for this faculty!
      </p>
    );
  }

  return (
    <section>
      <ul className="lessons-list">
        {lessons.map((lesson) => (
          <Lesson key={lesson.id} lesson={lesson} setLessons={setLessons} />
        ))}
      </ul>
      <p>
        There are {lessons.length} lessons shared. What lesson did you learn
        today?
      </p>
    </section>
  );
}

function Lesson({ lesson, setLessons }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    lesson.voteThumbsUp + lesson.voteMindBlown < lesson.voteWrong;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedLesson, error } = await supabase
      .from("LessonsTable")
      .update({ [columnName]: lesson[columnName] + 1 })
      .eq("id", lesson.id)
      .select();
    setIsUpdating(false);

    if (!error) {
      setLessons((lessons) =>
        lessons.map((l) => (l.id === lesson.id ? updatedLesson[0] : l))
      );
    }
  }

  return (
    <li className="lesson">
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
        {lesson.text}
        <a className="source" href={lesson.link} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: FACULTIES.find(
            (faculty) => faculty.facs === lesson.faculty
          ).color,
        }}
      >
        {lesson.faculty}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("voteThumbsUp")}
          disabled={isUpdating}
        >
          👍 {lesson.voteThumbsUp}
        </button>
        <button
          onClick={() => handleVote("voteMindBlown")}
          disabled={isUpdating}
        >
          🤯 {lesson.voteMindBlown}
        </button>
        <button onClick={() => handleVote("voteWrong")} disabled={isUpdating}>
          ⛔ {lesson.voteWrong}
        </button>
      </div>
    </li>
  );
}

export default App;
