import { useEffect, type RefObject } from "react";

export function useEscapeKey(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
}

export function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter((el) => {
    const style = window.getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

export function useFocusTrap(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  onClose?: () => void
) {
  useEffect(() => {
    if (!open) return;
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;
    const dialog = dialogNode as HTMLElement;

    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;

    // Ensure the container itself can be focused as a last resort.
    const prevTabIndex = dialog.getAttribute("tabindex");
    if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");

    const focusInitial = () => {
      const auto =
        dialog.querySelector<HTMLElement>("[data-autofocus]") ??
        dialog.querySelector<HTMLElement>("[autofocus]");
      const focusables = getFocusableElements(dialog);
      (auto ?? focusables[0] ?? dialog).focus();
    };

    const raf = window.requestAnimationFrame(focusInitial);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        const focusables = getFocusableElements(dialog);
        if (focusables.length === 0) {
          e.preventDefault();
          dialog.focus();
          return;
        }

        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first || !dialog.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last || !dialog.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      } else if (e.key === "Escape" && onClose) {
        e.preventDefault();
        onClose();
      }
    }

    dialog.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      dialog.removeEventListener("keydown", onKeyDown);

      if (prevTabIndex === null) dialog.removeAttribute("tabindex");
      else dialog.setAttribute("tabindex", prevTabIndex);

      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open, dialogRef, onClose]);
}

