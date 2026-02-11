import { useEffect, useMemo, useState } from "react";

type Opportunity = {
  id: number;
  title: string;
  description?: string;
  type: "Scholarship" | "Internship" | "Part time" | "Full time" | "Research" | "Volunteer" | string;
  location: string;
  paid: boolean;
  deadline?: string; // ISO
  link?: string;
  postedAt: string; // ISO
};

const STORAGE_KEY = "orizon_opportunities";

function loadFromStorage(): Opportunity[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Opportunity[];
  } catch {
    return [];
  }
}

function saveToStorage(list: Opportunity[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore for demo
  }
}

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);

  // Filters
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Any");
  const [locationFilter, setLocationFilter] = useState<string>("Any");
  const [paidFilter, setPaidFilter] = useState<string>("Any");
  const [deadlineFilter, setDeadlineFilter] = useState<string>("Any");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Opportunity>>({
    title: "",
    description: "",
    type: "Internship",
    location: "Remote",
    paid: true,
    deadline: undefined,
    link: "",
  });

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.length) {
      setItems(stored);
      return;
    }

    // Seed samples if empty
    const seed: Opportunity[] = [
      {
        id: Date.now() - 300000,
        title: "Undergraduate Research Assistant",
        description: "Assist faculty with experiments in the biology lab.",
        type: "Research",
        location: "On-campus",
        paid: true,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        link: "https://example.edu/research",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: Date.now() - 200000,
        title: "Summer Internship — Software Engineering",
        description: "Remote internship for students working on full-stack web apps.",
        type: "Internship",
        location: "Remote",
        paid: true,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        link: "https://example.com/internship",
        postedAt: new Date().toISOString(),
      },
      {
        id: Date.now() - 100000,
        title: "Global Scholars Award",
        description: "Merit-based scholarship for international students.",
        type: "Scholarship",
        location: "Worldwide",
        paid: false,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
        link: "https://example.org/scholarship",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ];

    setItems(seed);
    saveToStorage(seed);
  }, []);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return items.filter((it) => {
      if (query && !(`${it.title} ${it.description || ""} ${it.type}`.toLowerCase().includes(query.toLowerCase()))) {
        return false;
      }
      if (typeFilter !== "Any" && it.type !== typeFilter) return false;
      if (locationFilter !== "Any") {
        if (locationFilter === "Remote" && it.location.toLowerCase() !== "remote") return false;
        if (locationFilter === "Local" && it.location.toLowerCase() === "remote") return false;
      }
      if (paidFilter !== "Any") {
        if (paidFilter === "Paid" && !it.paid) return false;
        if (paidFilter === "Unpaid" && it.paid) return false;
      }
      if (deadlineFilter !== "Any" && it.deadline) {
        const due = new Date(it.deadline).getTime();
        if (deadlineFilter === "Upcoming" && due < now) return false;
        if (deadlineFilter === "Past" && due >= now) return false;
      }
      return true;
    });
  }, [items, query, typeFilter, locationFilter, paidFilter, deadlineFilter]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.type) return;
    const next: Opportunity = {
      id: Date.now(),
      title: form.title!.trim(),
      description: form.description?.trim() || "",
      type: (form.type as Opportunity["type"]) || "Internship",
      location: form.location || "Remote",
      paid: !!form.paid,
      deadline: form.deadline || undefined,
      link: form.link || undefined,
      postedAt: new Date().toISOString(),
    };
    setItems((s) => [next, ...s]);
    setForm({ title: "", description: "", type: "Internship", location: "Remote", paid: true, link: "" });
    setShowForm(false);
  }

  function removeItem(id: number) {
    setItems((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold">Opportunities</h1>
        <p className="text-gray-600">Find and share scholarships, internships, jobs, and more.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowForm((s) => !s)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              {showForm ? "Close" : "Submit Opportunity"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="px-3 py-2 border rounded-md" />
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="px-3 py-2 border rounded-md">
                  <option>Internship</option>
                  <option>Scholarship</option>
                  <option>Part time</option>
                  <option>Full time</option>
                  <option>Research</option>
                  <option>Volunteer</option>
                </select>
              </div>

              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 border rounded-md" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location (Remote / City)" className="px-3 py-2 border rounded-md" />
                <input type="date" value={form.deadline || ""} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value || undefined }))} className="px-3 py-2 border rounded-md" />
                <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="Link" className="px-3 py-2 border rounded-md" />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form.paid} onChange={(e) => setForm((f) => ({ ...f, paid: e.target.checked }))} />
                  Paid
                </label>
                <div className="ml-auto">
                  <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded-md">Post</button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {filtered.length === 0 && <div className="text-sm text-gray-500">No opportunities found.</div>}

            {filtered.map((it) => (
              <div key={it.id} className="bg-white rounded-xl p-4 border">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <a href={it.link || "#"} target="_blank" rel="noreferrer" className="font-medium text-gray-800 hover:underline">{it.title}</a>
                    <div className="text-xs text-gray-500 mt-1">{it.type} • {it.location} • {it.paid ? "Paid" : "Unpaid"}</div>
                    {it.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{it.description}</p>}
                    <div className="mt-2 text-[11px] text-gray-400">Posted {new Date(it.postedAt).toLocaleString()} {it.deadline && <>• due {new Date(it.deadline).toLocaleDateString()}</>}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => removeItem(it.id)} className="text-xs text-red-600">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="bg-white p-4 rounded-lg border space-y-2">
            <h3 className="text-sm font-semibold">Filters</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs">Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-2 py-1 border rounded-md mt-1 text-sm">
                  <option>Any</option>
                  <option>Scholarship</option>
                  <option>Internship</option>
                  <option>Part time</option>
                  <option>Full time</option>
                  <option>Research</option>
                  <option>Volunteer</option>
                </select>
              </div>

              <div>
                <label className="text-xs">Location</label>
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full px-2 py-1 border rounded-md mt-1 text-sm">
                  <option>Any</option>
                  <option>Remote</option>
                  <option>Local</option>
                </select>
              </div>

              <div>
                <label className="text-xs">Paid</label>
                <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)} className="w-full px-2 py-1 border rounded-md mt-1 text-sm">
                  <option>Any</option>
                  <option>Paid</option>
                  <option>Unpaid</option>
                </select>
              </div>

              <div>
                <label className="text-xs">Deadline</label>
                <select value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)} className="w-full px-2 py-1 border rounded-md mt-1 text-sm">
                  <option>Any</option>
                  <option>Upcoming</option>
                  <option>Past</option>
                </select>
              </div>

              <div className="pt-2">
                <button onClick={() => { setTypeFilter("Any"); setLocationFilter("Any"); setPaidFilter("Any"); setDeadlineFilter("Any"); setQuery(""); }} className="text-sm text-gray-600">Clear filters</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border text-sm text-gray-600">
            <strong>How it works</strong>
            <p className="mt-2 text-xs">Post opportunities for other students. Items are stored locally in your browser for demo purposes.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
