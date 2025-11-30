// apps/web/src/pages/CommunityQA.tsx
import { useState } from "react";
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
  answers: Answer[];
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "How long does it usually take to get the F-1 visa interview?",
    body: "I'm applying from Peru for Fall 2026 and I'm not sure how early I should book my embassy appointment.",
    author: "Ana · Peru",
    tags: ["visa", "Peru", "timeline"],
    answers: [], // ← sample reply removed
  },
  {
    id: 2,
    title: "Is on-campus housing required for first-year international students?",
    body: "I'm admitted to UC and wondering if I must live on campus my first year or if off-campus is allowed.",
    author: "Leo · Brazil",
    tags: ["housing", "UCincinnati"],
    answers: [],
  },
];

export default function CommunityQA() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // reply state
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const { user } = useAuth();
  const currentAuthor = user ? "Demo student · Orizon" : "Demo student";

  const filtered = questions.filter((q) => {
    const f = filter.toLowerCase();
    if (!f) return true;
    return (
      q.title.toLowerCase().includes(f) ||
      q.body.toLowerCase().includes(f) ||
      q.tags.some((t) => t.toLowerCase().includes(f))
    );
  });

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newQuestion: Question = {
      id: Date.now(),
      title: title.trim(),
      body: body.trim(),
      author: currentAuthor,
      tags: [],
      answers: [],
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    setTitle("");
    setBody("");
  }

  function handleOpenReply(questionId: number) {
    setActiveReplyId(questionId);
    setReplyBody("");
  }

  function handleSubmitReply(e: React.FormEvent, questionId: number) {
    e.preventDefault();
    if (!replyBody.trim()) return;

    const newAnswer: Answer = {
      id: Date.now(),
      body: replyBody.trim(),
      author: currentAuthor,
    };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      )
    );

    setReplyBody("");
    setActiveReplyId(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Left list */}
      <section className="bg-white rounded-2xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg font-semibold">Community Q&amp;A</h1>
            <p className="text-xs text-gray-500">
              Ask and answer questions as the demo user. Data lives only in this session.
            </p>
          </div>
          <input
            className="hidden sm:block rounded-lg border px-3 py-1.5 text-xs"
            placeholder="Search visas, housing, scholarships..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filtered.length === 0 && (
          <p className="text-xs text-gray-500">
            No questions match that search yet. Try another keyword.
          </p>
        )}

        <ul className="divide-y divide-gray-100 mt-2">
          {filtered.map((q) => (
            <li key={q.id} className="py-3">
              <h2 className="text-sm font-medium text-gray-900">{q.title}</h2>
              <p className="mt-1 text-xs text-gray-700">{q.body}</p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-gray-400">{q.author}</span>
                {q.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {t}
                  </span>
                ))}
                <span className="text-[11px] text-gray-400 ml-auto">
                  {q.answers.length} answer{q.answers.length !== 1 && "s"}
                </span>
              </div>

              {/* Answers */}
              {q.answers.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {q.answers.map((a) => (
                    <li
                      key={a.id}
                      className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <p>{a.body}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {a.author}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Reply */}
              <div className="mt-2">
                {activeReplyId !== q.id ? (
                  <button
                    type="button"
                    onClick={() => handleOpenReply(q.id)}
                    className="text-[11px] text-gray-600 hover:text-black"
                  >
                    Reply as {currentAuthor}
                  </button>
                ) : (
                  <form
                    className="mt-2 space-y-2"
                    onSubmit={(e) => handleSubmitReply(e, q.id)}
                  >
                    <textarea
                      className="w-full rounded-lg border px-2 py-1 text-xs resize-none min-h-[60px]"
                      placeholder="Write a short, helpful answer…"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
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
                          setReplyBody("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Right: ask */}
      <section className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-sm font-semibold mb-2">Ask a question</h2>
        <p className="text-xs text-gray-500 mb-3">
          Questions will be posted as{" "}
          <span className="font-medium">{currentAuthor}</span>.
        </p>

        <form className="space-y-3" onSubmit={handleAsk}>
          <label className="block">
            <span className="text-xs text-gray-500">Title</span>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. When should I book my visa interview from Peru?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500">Details</span>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm resize-none min-h-[120px]"
              placeholder="Add context so others can give specific advice."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="mt-1 inline-flex items-center rounded-xl px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
          >
            Post question
          </button>
        </form>
      </section>
    </div>
  );
}
