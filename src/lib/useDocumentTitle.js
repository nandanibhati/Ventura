import { useEffect } from "react";

/** Sets document.title for the lifetime of the calling page, restoring the previous title on unmount. */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — Veluntra` : "Veluntra";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
