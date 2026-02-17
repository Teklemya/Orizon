import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/apiBase";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${API_BASE}api/opportunities`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        if (!mounted) return;
        const norm: Opportunity[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          type: d.type,
          location: d.location,
          paid: !!d.paid,
          deadline: d.deadline || undefined,
          link: d.link || undefined,
          postedAt: d.posted_at || d.postedAt || new Date().toISOString(),
        }));
        setItems(norm);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load opportunities:", err);
        if (!mounted) return;
        setError("Failed to load opportunities");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
    const payload = {
      title: form.title!.trim(),
      description: form.description?.trim() || undefined,
      type: form.type || undefined,
      location: form.location || undefined,
      paid: !!form.paid,
      deadline: form.deadline || undefined,
      link: form.link || undefined,
    };

    fetch(`${API_BASE}api/opportunities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((d) => {
        const created: Opportunity = {
          id: d.id,
          title: d.title,
          description: d.description,
          type: d.type,
          location: d.location,
          paid: !!d.paid,
          deadline: d.deadline || undefined,
          link: d.link || undefined,
          postedAt: d.posted_at || d.postedAt || new Date().toISOString(),
        };
        setItems((s) => [created, ...s]);
        setForm({ title: "", description: "", type: "Internship", location: "Remote", paid: true, link: "" });
        setShowForm(false);
      })
      .catch((err) => {
        console.error("Failed to create opportunity:", err);
        setError("Failed to create opportunity");
      });
  }

  function removeItem(id: number) {
    fetch(`${API_BASE}api/opportunities/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setItems((s) => s.filter((x) => x.id !== id));
      })
      .catch((err) => {
        console.error("Failed to delete opportunity:", err);
        setError("Failed to delete opportunity");
      });
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
            {loading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {!loading && filtered.length === 0 && <div className="text-sm text-gray-500">No opportunities found.</div>}

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
            <p className="mt-2 text-xs">Post opportunities for other students. Items are stored in the database and shared across users.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
