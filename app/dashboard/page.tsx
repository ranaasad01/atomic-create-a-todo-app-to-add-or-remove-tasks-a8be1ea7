"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Plus, Trash2, Check, ClipboardList, LogOut, User } from 'lucide-react';
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/Reveal";
import { staggerContainer, fadeInUp } from "@/lib/motion";
import type { Task } from "@/lib/data";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -24,
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const emptyVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth check + initial data load
  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (mounted) setUserEmail(user.email ?? null);

      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted) {
        if (fetchError) {
          setError("Failed to load tasks. Please refresh.");
        } else {
          setTasks((data as Task[]) ?? []);
        }
        setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const handleAddTask = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const title = newTitle.trim();
      if (!title || adding) return;

      setAdding(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert({
          title,
          is_complete: false,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        setError("Could not add task. Try again.");
      } else if (data) {
        setTasks((prev) => [data as Task, ...prev]);
        setNewTitle("");
      }

      setAdding(false);
    },
    [newTitle, adding, router, supabase]
  );

  const handleToggle = useCallback(
    async (task: Task) => {
      const updated = !task.is_complete;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, is_complete: updated } : t
        )
      );

      const { error: updateError } = await supabase
        .from("tasks")
        .update({ is_complete: updated, updated_at: new Date().toISOString() })
        .eq("id", task.id);

      if (updateError) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, is_complete: task.is_complete } : t
          )
        );
        setError("Could not update task.");
      }
    },
    [supabase]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      // Optimistic remove
      setTasks((prev) => prev.filter((t) => t.id !== id));

      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (deleteError) {
        setError("Could not delete task. Please refresh.");
      }
    },
    [supabase]
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router, supabase]);

  const completedCount = tasks.filter((t) => t.is_complete).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] pb-24">
      {/* Page header */}
      <Reveal>
        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                  My Tasks
                </h1>
                {userEmail && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                    <User className="h-3.5 w-3.5" />
                    {userEmail}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-all duration-200 hover:border-red-400/60 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span>
                    {completedCount} of {totalCount} completed
                  </span>
                  <span>
                    {Math.round((completedCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--border))]">
                  <motion.div
                    className="h-full rounded-full bg-[var(--accent)]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.round((completedCount / totalCount) * 100)}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add task input */}
        <Reveal>
          <form
            onSubmit={handleAddTask}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              maxLength={200}
              className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
            <motion.button
              type="submit"
              disabled={!newTitle.trim() || adding}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.15)] transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
            >
              {adding ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </motion.button>
          </form>
        </Reveal>

        {/* Task list */}
        <div className="mt-6">
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div
                key="empty"
                variants={emptyVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
                  <ClipboardList className="h-9 w-9 text-[hsl(var(--muted-foreground))]" />
                </div>
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  No tasks yet
                </h2>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  Add your first task above and start getting things done. Every
                  great day starts with a clear list.
                </p>
              </motion.div>
            ) : (
              <motion.ul
                key="list"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2.5"
              >
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.li
                      key={task.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-6px_rgba(0,0,0,0.1)]"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggle(task)}
                        aria-label={
                          task.is_complete
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                        className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 rounded-md"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                            task.is_complete
                              ? "border-[var(--accent)] bg-[var(--accent)]"
                              : "border-[hsl(var(--border))] bg-transparent hover:border-[var(--accent)]/60"
                          }`}
                        >
                          <AnimatePresence>
                            {task.is_complete && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Check className="h-3 w-3 text-white" strokeWidth={3} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </button>

                      {/* Title */}
                      <span
                        className={`flex-1 text-sm leading-snug transition-all duration-200 ${
                          task.is_complete
                            ? "text-[hsl(var(--muted-foreground))] line-through"
                            : "text-[hsl(var(--foreground))]"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Delete */}
                      <motion.button
                        onClick={() => handleDelete(task.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Delete task"
                        className="flex-shrink-0 rounded-md p-1 text-[hsl(var(--muted-foreground))] opacity-0 transition-all duration-200 hover:text-red-500 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Footer stats */}
        {totalCount > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-8 flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span>{totalCount - completedCount} remaining</span>
              <span>{completedCount} done</span>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}