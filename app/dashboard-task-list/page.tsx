"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Circle, Sparkles, ClipboardList, AlertCircle } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import type { Task } from "@/lib/data";

type Filter = "all" | "active" | "completed";

export default function DashboardTaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) {
      setError("Failed to load tasks. Please try again.");
    } else {
      setTasks((data as Task[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) {
      setError("You must be signed in to add tasks.");
      setAdding(false);
      return;
    }
    const now = new Date().toISOString();
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({ title, is_complete: false, user_id, created_at: now, updated_at: now })
      .select()
      .single();
    if (insertError) {
      setError("Failed to add task.");
    } else if (data) {
      setTasks((prev) => [data as Task, ...prev]);
      setNewTitle("");
    }
    setAdding(false);
  };

  const handleToggle = async (task: Task) => {
    setTogglingId(task.id);
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ is_complete: !task.is_complete, updated_at: new Date().toISOString() })
      .eq("id", task.id);
    if (!updateError) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_complete: !t.is_complete } : t))
      );
    }
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", id);
    if (!deleteError) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.is_complete;
    if (filter === "completed") return t.is_complete;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.is_complete).length;
  const activeCount = tasks.filter((t) => !t.is_complete).length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filterLabels: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <Reveal>
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Task Dashboard
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-5xl">
              My Tasks
            </h1>
            <p className="mt-3 text-base text-[hsl(var(--muted-foreground))]">
              Stay focused. Track what matters. Get things done.
            </p>
          </div>
        </Reveal>

        {/* Stats Row */}
        <Reveal delay={0.08}>
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: totalCount, color: "text-[hsl(var(--foreground))]" },
              { label: "Active", value: activeCount, color: "text-[var(--accent)]" },
              { label: "Done", value: completedCount, color: "text-emerald-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)]"
              >
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <Reveal delay={0.12}>
            <div className="mb-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)]">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-[hsl(var(--foreground))]">Progress</span>
                <span className="text-[hsl(var(--muted-foreground))]">{completionPct}% complete</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </Reveal>
        )}

        {/* Add Task Form */}
        <Reveal delay={0.16}>
          <form
            onSubmit={handleAdd}
            className="mb-6 flex gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)]"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
              disabled={adding}
              maxLength={200}
            />
            <motion.button
              type="submit"
              disabled={adding || !newTitle.trim()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground,#000)] transition-opacity disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {adding ? "Adding..." : "Add"}
            </motion.button>
          </form>
        </Reveal>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <Reveal delay={0.2}>
          <div className="mb-5 flex gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? "bg-[var(--accent)] text-[var(--accent-foreground,#000)] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Task List */}
        <Reveal delay={0.24}>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-[hsl(var(--muted-foreground))]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-6 w-6 rounded-full border-2 border-[var(--accent)] border-t-transparent"
                />
                <span className="text-sm">Loading tasks...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-[hsl(var(--muted-foreground))]">
                <ClipboardList className="h-10 w-10 opacity-30" />
                <p className="text-sm">
                  {filter === "all"
                    ? "No tasks yet. Add one above to get started."
                    : filter === "active"
                    ? "No active tasks. Great work!"
                    : "No completed tasks yet."}
                </p>
              </div>
            ) : (
              <motion.ul
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="divide-y divide-[hsl(var(--border))]"
              >
                <AnimatePresence initial={false}>
                  {filtered.map((task) => (
                    <motion.li
                      key={task.id}
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                      layout
                      className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[hsl(var(--muted))]/40"
                    >
                      {/* Toggle Button */}
                      <motion.button
                        onClick={() => handleToggle(task)}
                        disabled={togglingId === task.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={task.is_complete ? "Mark incomplete" : "Mark complete"}
                        className="shrink-0 transition-colors"
                      >
                        {task.is_complete ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[var(--accent)] transition-colors" />
                        )}
                      </motion.button>

                      {/* Title */}
                      <span
                        className={`flex-1 text-sm leading-relaxed transition-all duration-200 ${
                          task.is_complete
                            ? "line-through text-[hsl(var(--muted-foreground))]"
                            : "text-[hsl(var(--foreground))]"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Date */}
                      <span className="hidden shrink-0 text-xs text-[hsl(var(--muted-foreground))] sm:block">
                        {new Date(task.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {/* Delete Button */}
                      <motion.button
                        onClick={() => handleDelete(task.id)}
                        disabled={deletingId === task.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Delete task"
                        className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] opacity-0 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>
        </Reveal>

        {/* Footer hint */}
        {!loading && tasks.length > 0 && (
          <Reveal delay={0.28}>
            <p className="mt-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
              {completedCount > 0
                ? `${completedCount} of ${totalCount} task${totalCount !== 1 ? "s" : ""} completed`
                : `${activeCount} task${activeCount !== 1 ? "s" : ""} remaining`}
            </p>
          </Reveal>
        )}
      </div>
    </main>
  );
}