// Client-side gate for the /admin area.
// NOTE: this is NOT real security — anyone with the bundle can read this string.
// It's adequate to keep casual visitors out of the editor, nothing more.
export const ADMIN_PASSWORD = "unfold2026";
const KEY = "unfold:adminAuthed";

export const isAdminAuthed = () =>
  typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1";

export const signInAdmin = (password: string) => {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
};

export const signOutAdmin = () => sessionStorage.removeItem(KEY);
