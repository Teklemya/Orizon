import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth";
import { API_BASE } from "../lib/apiBase";
import { supabase } from "../lib/supabase";

type Opportunity = {
  id: number;
  title: string;
  description?: string;
  type:
    | "Scholarship"
    | "Internship"
    | "Part time"
    | "Full time"
    | "Research"
    | "Volunteer"
    | string;
  location: string;
  paid: boolean;
  deadline?: string; // ISO
  link?: string;
  postedAt: string; // ISO
  createdBy?: string;
};

type OpportunityApiRow = {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  location: string;
  paid: boolean | number | null;
  deadline?: string | null;
  link?: string | null;
  posted_at?: string | null;
  postedAt?: string | null;
  created_by?: string | null;
  createdBy?: string | null;
};

function normalizeUserId(value?: string | null) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

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
  const currentUserId = normalizeUserId(user?.id);
  const isAdmin = userRole === "admin";

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`${API_BASE}/api/opportunities`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: OpportunityApiRow[]) => {
        if (!mounted) return;

        const norm: Opportunity[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description ?? undefined,
          type: d.type,
          location: d.location,
          paid: !!d.paid,
          deadline: d.deadline || undefined,
          link: d.link || undefined,
          postedAt: d.posted_at || d.postedAt || new Date().toISOString(),
          createdBy:
            normalizeUserId(d.created_by) ??
            normalizeUserId(d.createdBy) ??
            undefined,
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

  useEffect(() => {
    const userId = user?.id;

    if (!userId) {
      setUserRole(null);
      return;
    }

    let mounted = true;

    async function loadUserRole() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle<{ role: string | null }>();

        if (error) {
          throw error;
        }

        if (mounted && typeof data?.role === "string") {
          setUserRole(data.role.toLowerCase());
          return;
        }
      } catch (err) {
        console.error("Failed to load profile role from Supabase:", err);
      }

      try {
        const res = await fetch(`${API_BASE}/api/profile/${userId}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        if (!mounted) return;

        setUserRole(
          typeof data.role === "string" ? data.role.toLowerCase() : null
        );
      } catch (err) {
        console.error("Failed to load profile role from API:", err);
        if (!mounted) return;
        setUserRole(null);
      }
    }

    void loadUserRole();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const filtered = useMemo(() => {
    const now = Date.now();

    return items.filter((it) => {
      if (
        query &&
        !`${it.title} ${it.description || ""} ${it.type}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "Any" && it.type !== typeFilter) return false;

      if (locationFilter !== "Any") {
        if (
          locationFilter === "Remote" &&
          it.location.toLowerCase() !== "remote"
        ) {
          return false;
        }

        if (
          locationFilter === "Local" &&
          it.location.toLowerCase() === "remote"
        ) {
          return false;
        }
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

    if (!user?.id) {
      setError("Please sign in to post an opportunity");
      return;
    }

    if (!form.title || !form.type) return;

    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      type: form.type || undefined,
      location: form.location || undefined,
      paid: !!form.paid,
      deadline: form.deadline || undefined,
      link: form.link || undefined,
      created_by: user.id,
    };

    fetch(`${API_BASE}/api/opportunities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((d: OpportunityApiRow) => {
        const created: Opportunity = {
          id: d.id,
          title: d.title,
          description: d.description ?? undefined,
          type: d.type,
          location: d.location,
          paid: !!d.paid,
          deadline: d.deadline || undefined,
          link: d.link || undefined,
          postedAt: d.posted_at || d.postedAt || new Date().toISOString(),
          createdBy:
            normalizeUserId(d.created_by) ??
            normalizeUserId(d.createdBy) ??
            currentUserId ??
            undefined,
        };

        setItems((s) => [created, ...s]);
        setForm({
          title: "",
          description: "",
          type: "Internship",
          location: "Remote",
          paid: true,
          link: "",
        });
        setShowForm(false);
      })
      .catch((err) => {
        console.error("Failed to create opportunity:", err);
        setError("Failed to create opportunity");
      });
  }

  function removeItem(id: number) {
    if (!user?.id) {
      setError("Please sign in to remove your opportunity");
      return;
    }

    setError(null);

    fetch(`${API_BASE}/api/opportunities/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requester_id: user.id }),
    })
      .then(async (res) => {
        if (!res.ok) {
          let message = `Status ${res.status}`;

          try {
            const data = await res.json();
            if (typeof data?.error === "string" && data.error.trim()) {
              message = data.error;
            }
          } catch {
            // Ignore JSON parsing issues and keep the status-based message.
          }

          throw new Error(message);
        }

        setItems((s) => s.filter((x) => x.id !== id));
      })
      .catch((err) => {
        console.error("Failed to delete opportunity:", err);
        setError(
          err instanceof Error && err.message
            ? err.message
            : "Failed to delete opportunity"
        );
      });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section className="bg-white rounded-2xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg font-semibold">Opportunities</h1>
            <p className="text-xs text-gray-500">
              Find and share scholarships, internships, jobs, and more.
            </p>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword"
            className="hidden sm:block rounded-lg border px-3 py-1.5 text-xs w-[280px]"
          />
        </div>

        <div className="sm:hidden mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-3 mt-2">
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-gray-500">No opportunities found.</div>
          )}

          {filtered.map((it) => (
            <div
              key={it.id}
              className="rounded-xl border border-gray-200 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={it.link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-semibold text-gray-900 leading-snug hover:underline"
                  >
                    {it.title}
                  </a>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
                    <span>{it.type}</span>
                    <span>•</span>
                    <span>{it.location}</span>
                    <span>•</span>
                    <span>{it.paid ? "Paid" : "Unpaid"}</span>
                  </div>

                  {it.description && (
                    <p className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-6">
                      {it.description}
                    </p>
                  )}

                  <div className="mt-3 text-[11px] text-gray-400">
                    Posted {new Date(it.postedAt).toLocaleString()}
                    {it.deadline && (
                      <> • due {new Date(it.deadline).toLocaleDateString()}</>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {(isAdmin || normalizeUserId(it.createdBy) === currentUserId) && (
                    <button
                      onClick={() => removeItem(it.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="bg-white rounded-2xl shadow p-5 h-fit">
        <div>
          <h3 className="text-sm font-semibold mb-3">Filters</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
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
              <label className="block text-xs text-gray-500 mb-1">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option>Any</option>
                <option>Remote</option>
                <option>Local</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Paid</label>
              <select
                value={paidFilter}
                onChange={(e) => setPaidFilter(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option>Any</option>
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Deadline
              </label>
              <select
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option>Any</option>
                <option>Upcoming</option>
                <option>Past</option>
              </select>
            </div>

            <button
              onClick={() => {
                setTypeFilter("Any");
                setLocationFilter("Any");
                setPaidFilter("Any");
                setDeadlineFilter("Any");
                setQuery("");
              }}
              className="text-sm text-gray-500 hover:text-black"
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold">How it works</h3>
          <p className="mt-2 text-xs text-gray-600">
            Post opportunities for other students. Items are stored in the
            database and shared across users.
          </p>

          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="mt-4 rounded-lg px-2.5 py-1 bg-black text-white text-xs font-medium hover:bg-gray-800"
          >
            {showForm ? "Close" : "Submit Opportunity"}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option>Internship</option>
                <option>Scholarship</option>
                <option>Part time</option>
                <option>Full time</option>
                <option>Research</option>
                <option>Volunteer</option>
              </select>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                className="w-full rounded-lg border px-3 py-2 text-sm min-h-[120px]"
              />

              <input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Location (Remote / City)"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={form.deadline || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deadline: e.target.value || undefined,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />

              <input
                value={form.link}
                onChange={(e) =>
                  setForm((f) => ({ ...f, link: e.target.value }))
                }
                placeholder="Link"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!form.paid}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, paid: e.target.checked }))
                    }
                  />
                  Paid
                </label>
              </div>

              <button
                type="submit"
                className="rounded-xl px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
              >
                Post
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}