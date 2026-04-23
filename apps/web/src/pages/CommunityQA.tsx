import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../lib/auth";
import { API_BASE } from "../lib/apiBase";
import RichTextEditor from "../components/RichTextEditor";

type Answer = {
  id: number;
  question_id: number;
  body: string;
  author: string;
  author_id?: string;
  created_at?: string;
};

type Question = {
  id: number;
  title: string;
  body: string;
  author: string;
  author_id?: string;
  created_at?: string;
  tags: string[];
  category: string;
  answers: Answer[];
};

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

function safeHTML(html: string) {
  if (!html || typeof html !== "string") return "<p></p>";
  return html;
}

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function CommunityQA() {
  const { user } = useAuth();

  const currentAuthor = user?.email?.split("@")[0] || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [pendingScrollQuestionId, setPendingScrollQuestionId] = useState<
    number | null
  >(null);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<
    number | null
  >(null);

  const questionRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);

  const API_URL = `${API_BASE}/api/questions`;

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
    "Wellbeing",
    "Social",
  ];

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("<p></p>");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("");

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("<p></p>");

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [editQuestionTitle, setEditQuestionTitle] = useState("");
  const [editQuestionBody, setEditQuestionBody] = useState("<p></p>");
  const [editQuestionCategory, setEditQuestionCategory] = useState("");

  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editAnswerBody, setEditAnswerBody] = useState("<p></p>");

  async function loadQuestions() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch questions");

      const data: Question[] = await res.json();

      const questionsWithAnswers = await Promise.all(
        data.map(async (q) => {
          const aRes = await fetch(`${API_URL}/${q.id}/answers`);
          const answers = aRes.ok ? await aRes.json() : [];
          return {
            ...q,
            category: capitalize(q.category),
            answers,
          };
        })
      );

      console.log("First question from API:", data?.[0]);
      setQuestions(questionsWithAnswers);
    } catch (err) {
      console.error(err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const derivedCategories = useMemo(() => {
    return Array.from(
      new Set([
        ...BASE_CATEGORIES,
        ...questions.map((q) => capitalize(q.category)).filter(Boolean),
      ])
    ).sort();
  }, [questions]);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();

    return questions.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(f) ||
        q.body.toLowerCase().includes(f) ||
        q.tags?.some((t) => t.toLowerCase().includes(f));

      const matchesCategory =
        selectedCategory === "All" ||
        capitalize(q.category) === capitalize(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [questions, filter, selectedCategory]);

  const myQuestions = useMemo(() => {
    if (!user?.id) return [];

    return [...questions]
      .filter((q) => q.author_id === user.id)
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [questions, user?.id]);

  useEffect(() => {
    if (pendingScrollQuestionId == null || loading) return;

    const node = questionRefs.current[pendingScrollQuestionId];
    if (!node) return;

    node.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setHighlightedQuestionId(pendingScrollQuestionId);
    setPendingScrollQuestionId(null);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedQuestionId(null);
      highlightTimeoutRef.current = null;
    }, 1600);
  }, [pendingScrollQuestionId, loading, filtered]);

  function handleJumpToQuestion(questionId: number) {
    setFilter("");
    setSelectedCategory("All");
    setPendingScrollQuestionId(questionId);
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();

    if (!user?.email) {
      alert("You must be logged in (demo login) to post.");
      return;
    }

    if (!title.trim() || !body.trim() || !category) return;

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && t !== category.toLowerCase());

    const payload = {
      title: title.trim(),
      body,
      author: currentAuthor,
      author_id: user?.id,
      tags: parsedTags,
      category: capitalize(category.trim()),
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to post question.");
      return;
    }

    setTitle("");
    setBody("<p></p>");
    setTagsInput("");
    setCategory("");

    await loadQuestions();
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!user?.email) return;

    const ok = confirm("Delete this question?");
    if (!ok) return;

    const res = await fetch(`${API_URL}/${questionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_id: user?.id }),
    });

    if (!res.ok) {
      alert("Failed to delete question (not authorized?).");
      return;
    }

    await loadQuestions();
  }

  function startEditQuestion(q: Question) {
    setEditingQuestionId(q.id);
    setEditQuestionTitle(q.title);
    setEditQuestionBody(q.body || "<p></p>");
    setEditQuestionCategory(capitalize(q.category));
  }

  function cancelEditQuestion() {
    setEditingQuestionId(null);
    setEditQuestionTitle("");
    setEditQuestionBody("<p></p>");
    setEditQuestionCategory("");
  }

  async function handleSaveEditQuestion(questionId: number) {
    if (!user?.email) return;

    const res = await fetch(`${API_URL}/${questionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editQuestionTitle.trim(),
        body: editQuestionBody,
        category: capitalize(editQuestionCategory.trim()),
        author_id: user?.id,
      }),
    });

    if (!res.ok) {
      alert("Failed to update question (not authorized?).");
      return;
    }

    cancelEditQuestion();
    await loadQuestions();
  }

  async function handleSubmitReply(e: React.FormEvent, questionId: number) {
    e.preventDefault();

    if (!user?.email) {
      alert("You must be logged in (demo login) to reply.");
      return;
    }

    if (!replyBody.trim()) return;

    const res = await fetch(`${API_URL}/${questionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: currentAuthor,
        author_id: user?.id,
        body: replyBody,
      }),
    });

    if (!res.ok) {
      alert("Failed to post answer.");
      return;
    }

    setReplyBody("<p></p>");
    setActiveReplyId(null);

    await loadQuestions();
  }

  async function handleDeleteAnswer(questionId: number, answerId: number) {
    if (!user?.email) return;

    const ok = confirm("Delete this answer?");
    if (!ok) return;

    const res = await fetch(`${API_URL}/${questionId}/answers/${answerId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_id: user?.id }),
    });

    if (!res.ok) {
      alert("Failed to delete answer (not authorized?).");
      return;
    }

    await loadQuestions();
  }

  function startEditAnswer(a: Answer) {
    setEditingAnswerId(a.id);
    setEditAnswerBody(a.body || "<p></p>");
  }

  function cancelEditAnswer() {
    setEditingAnswerId(null);
    setEditAnswerBody("<p></p>");
  }

  async function handleSaveEditAnswer(questionId: number, answerId: number) {
    if (!user?.email) return;

    const res = await fetch(`${API_URL}/${questionId}/answers/${answerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: editAnswerBody,
        author_id: user?.id,
      }),
    });

    if (!res.ok) {
      alert("Failed to update answer (not authorized?).");
      return;
    }

    cancelEditAnswer();
    await loadQuestions();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section className="bg-white rounded-2xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg font-semibold">Community Q&amp;A</h1>
            <p className="text-xs text-gray-500">Browse by category and topic.</p>
          </div>
          <input
            className="hidden sm:block rounded-lg border px-3 py-1.5 text-xs"
            placeholder="Search visas, housing, scholarships..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

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
            {filtered.map((q) => {
              const isOwner = user?.id && q.author_id === user.id;

              return (
                <li
                  key={q.id}
                  ref={(el) => {
                    questionRefs.current[q.id] = el;
                  }}
                  className={`py-3 scroll-mt-24 transition-all duration-500 ${
                    highlightedQuestionId === q.id
                      ? "rounded-xl bg-yellow-50 px-3 ring-1 ring-yellow-200"
                      : ""
                  }`}
                >
                  {editingQuestionId === q.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        value={editQuestionTitle}
                        onChange={(e) => setEditQuestionTitle(e.target.value)}
                      />

                      <RichTextEditor
                        content={editQuestionBody}
                        onChange={setEditQuestionBody}
                        placeholder="Edit question..."
                      />

                      <select
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        value={editQuestionCategory}
                        onChange={(e) => setEditQuestionCategory(e.target.value)}
                      >
                        {derivedCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg px-3 py-1.5 bg-black text-white text-xs hover:bg-gray-800"
                          onClick={() => handleSaveEditQuestion(q.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-xs text-gray-500"
                          onClick={cancelEditQuestion}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-base font-semibold text-gray-900 leading-snug">
                        {q.title}
                      </h2>

                      <div
                        className="mt-2 text-gray-700 [&_p]:text-[14px] [&_p]:leading-[1.35] [&_p]:mb-2 [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:text-[10px] [&_li]:leading-[1.35] [&_h1]:text-xs [&_h1]:font-semibold [&_h2]:text-xs [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: safeHTML(q.body) }}
                      />

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-gray-400">
                          {q.author}
                        </span>

                        {q.created_at && (
                          <span className="text-[11px] text-gray-400">
                            {formatDateTime(q.created_at)}
                          </span>
                        )}

                        {q.tags?.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                          >
                            {t}
                          </span>
                        ))}

                        {q.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            {capitalize(q.category)}
                          </span>
                        )}

                        <span className="text-[11px] text-gray-400 ml-auto">
                          {q.answers?.length || 0} answer
                          {q.answers?.length !== 1 && "s"}
                        </span>
                      </div>

                      {isOwner && (
                        <div className="mt-2 flex gap-3">
                          <button
                            type="button"
                            className="text-[11px] text-gray-600 hover:text-black"
                            onClick={() => startEditQuestion(q)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-[11px] text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {q.answers?.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {q.answers.map((a) => {
                        const isAnswerOwner =
                          user?.id && a.author_id === user.id;

                        return (
                          <li
                            key={a.id}
                            className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                          >
                            {editingAnswerId === a.id ? (
                              <div className="space-y-2">
                                <RichTextEditor
                                  content={editAnswerBody}
                                  onChange={setEditAnswerBody}
                                  placeholder="Edit answer..."
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    className="rounded-lg px-3 py-1.5 bg-black text-white text-[11px] hover:bg-gray-800"
                                    onClick={() =>
                                      handleSaveEditAnswer(q.id, a.id)
                                    }
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="text-[11px] text-gray-500"
                                    onClick={cancelEditAnswer}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="text-gray-700 [&_p]:text-[11px] [&_p]:leading-[1.45] [&_p]:mb-2 [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:text-[11px] [&_li]:leading-[1.45] [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_strong]:font-semibold"
                                  dangerouslySetInnerHTML={{
                                    __html: safeHTML(a.body),
                                  }}
                                />

                                <p className="mt-2 text-[10px] text-gray-400">
                                  {a.author}
                                </p>

                                {a.created_at && (
                                  <p className="mt-1 text-[10px] text-gray-400">
                                    {formatDateTime(a.created_at)}
                                  </p>
                                )}

                                {isAnswerOwner && (
                                  <div className="mt-1 flex gap-3">
                                    <button
                                      type="button"
                                      className="text-[11px] text-gray-600 hover:text-black"
                                      onClick={() => startEditAnswer(a)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="text-[11px] text-red-600 hover:text-red-800"
                                      onClick={() =>
                                        handleDeleteAnswer(q.id, a.id)
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="mt-3">
                    {activeReplyId !== q.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(q.id);
                          setReplyBody("<p></p>");
                        }}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 transition hover:text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6 4 12l6 6"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 12H5"
                          />
                        </svg>
                        <span>Reply as {currentAuthor}</span>
                      </button>
                    ) : (
                      <form
                        className="mt-2 space-y-2"
                        onSubmit={(e) => handleSubmitReply(e, q.id)}
                      >
                        <RichTextEditor
                          content={replyBody}
                          onChange={setReplyBody}
                          placeholder="Write a helpful answer..."
                        />

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-lg px-3 py-1.5 bg-black text-white text-[11px] hover:bg-gray-800"
                          >
                            Post answer
                          </button>
                          <button
                            type="button"
                            className="text-[11px] text-gray-500"
                            onClick={() => {
                              setActiveReplyId(null);
                              setReplyBody("<p></p>");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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

          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Write your question details..."
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

        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              My Questions
            </h3>
            {user?.id && (
              <span className="text-xs text-gray-400">
                {myQuestions.length} total
              </span>
            )}
          </div>

          {!user?.id ? (
            <p className="text-xs text-gray-500">
              Log in to see the questions you posted.
            </p>
          ) : myQuestions.length === 0 ? (
            <p className="text-xs text-gray-500">
              You have not posted any questions yet.
            </p>
          ) : (
            <div className="space-y-2">
              {myQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleJumpToQuestion(q.id)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left transition hover:bg-gray-100"
                >
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">
                    {q.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {q.answers?.length || 0} repl
                    {q.answers?.length === 1 ? "y" : "ies"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}