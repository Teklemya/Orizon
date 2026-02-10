import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";

type Answer = {
  id: number;
  body: string;
  author: string;
};

type Question = {
  id: number;
  title: string;
  body: string;
  author: string;
  tags: string[];
  category: string;
  answers?: Answer[];
};

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

export default function CommunityQA() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const currentAuthor = user ? "Demo student · Orizon" : "Demo student";

  const API_URL = "http://localhost:4000/api/questions";

  // ✅ Dummy + common categories (your system vocabulary)
  const BASE_CATEGORIES = [
    "Visa",
    "Housing",
    "Banking",
    "Finance",
    "Scholarships",
    "Arrival",
    "Mobile",
    "Work",
    "Healthcare",
    "Transportation",
    "Campus Life",
    "Legal",
    "Documents",
    "Jobs",
    "Accommodation",
    "Tuition",
    "Internships",
  ];

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();

        // ✅ Normalize categories from DB
        const normalized = data.map((q: Question) => ({
          ...q,
          category: capitalize(q.category),
        }));

        setQuestions(normalized);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load questions.");
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  // ✅ Merge DB categories + base categories
  const derivedCategories = Array.from(
    new Set([
      ...BASE_CATEGORIES,
      ...questions.map((q) => capitalize(q.category)).filter(Boolean),
    ])
  ).sort();

  const filtered = questions.filter((q) => {
    const f = filter.toLowerCase();

    const matchesSearch =
      q.title.toLowerCase().includes(f) ||
      q.body.toLowerCase().includes(f) ||
      q.tags?.some((t) => t.toLowerCase().includes(f));

    const matchesCategory =
      selectedCategory === "All" || capitalize(q.category) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !category) return;

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && t !== category.toLowerCase()); // ✅ prevent category as tag

    const payload = {
      title: title.trim(),
      body: body.trim(),
      author: currentAuthor,
      tags: parsedTags,
      category: capitalize(category.trim()),
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await fetch(API_URL).then((r) => r.json());
      const normalized = updated.map((q: Question) => ({
        ...q,
        category: capitalize(q.category),
      }));
      setQuestions(normalized);
      setTitle("");
      setBody("");
      setTagsInput("");
      setCategory("");
    } else {
      alert("Failed to post question.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* LEFT SIDE */}
      <section className="bg-white rounded-2xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg font-semibold">Community Q&A</h1>
            <p className="text-xs text-gray-500">Browse by category and topic.</p>
          </div>
          <input
            className="hidden sm:block rounded-lg border px-3 py-1.5 text-xs"
            placeholder="Search visas, housing, scholarships..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* ✅ CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", ...derivedCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading questions...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-500">No questions found.</p>
        ) : (
          <ul className="divide-y divide-gray-100 mt-2">
            {filtered.map((q) => (
              <li key={q.id} className="py-3">
                <h2 className="text-sm font-medium text-gray-900">{q.title}</h2>
                <p className="mt-1 text-xs text-gray-700">{q.body}</p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-gray-400">{q.author}</span>

                  {/* ✅ TAGS (GRAY) */}
                  {q.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                    >
                      {t}
                    </span>
                  ))}

                  {/* ✅ CATEGORY (YELLOW) */}
                  {q.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                      {capitalize(q.category)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RIGHT SIDE */}
      <section className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-sm font-semibold mb-2">Ask a question</h2>
        <p className="text-xs text-gray-500 mb-3">
          Posted as <span className="font-medium">{currentAuthor}</span>.
        </p>

        <form className="space-y-3" onSubmit={handleAsk}>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm resize-none min-h-[100px]"
            placeholder="Details"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {derivedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button className="rounded-xl px-4 py-2 bg-black text-white text-sm hover:bg-gray-800">
            Post question
          </button>
        </form>
      </section>
    </div>
  );
}
