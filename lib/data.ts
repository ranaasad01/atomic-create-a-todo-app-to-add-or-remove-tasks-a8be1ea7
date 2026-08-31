export const APP_NAME = "TodoApp";
export const APP_TAGLINE = "Stay on top of everything that matters.";
export const APP_DESCRIPTION =
  "Your personal workspace — private, fast, and always in sync.";

export interface NavLink {
  label: string;
  href: string;
  key: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "Dashboard", href: "/dashboard", key: "dashboard" },
  { label: "Sign In", href: "/login", key: "login" },
  { label: "Sign Up", href: "/signup", key: "signup" },
];

export interface Task {
  id: string;
  user_id: string;
  title: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}