"use client";

import { useState, type ComponentProps } from "react";
import { cx } from "@/components/ui";

/**
 * A password input that warns when Caps Lock is on — the classic silent
 * cause of a wrong password. Detected via the keyboard event's modifier
 * state, not a guess from the typed characters.
 */
export function PasswordField({
  label,
  hint,
  id,
  className,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  const [capsLock, setCapsLock] = useState(false);
  const inputId = id ?? props.name;

  function checkCapsLock(e: React.KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === "function") setCapsLock(e.getModifierState("CapsLock"));
  }

  return (
    <div className="block">
      <label className="block" htmlFor={inputId}>
        <span className="mb-1.5 block text-sm font-medium">{label}</span>
        <div className="relative">
          <input
            {...props}
            id={inputId}
            type="password"
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            onBlur={(e) => {
              setCapsLock(false);
              props.onBlur?.(e);
            }}
            aria-describedby={`${inputId}-capslock`}
            className={cx(
              "w-full rounded-lg border border-line-strong bg-elev px-3 py-2.5 pr-9 text-sm outline-none transition-colors placeholder:text-faint focus:border-accent",
              className,
            )}
          />
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className={cx(
              "pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warning transition-opacity duration-150",
              capsLock ? "opacity-100" : "opacity-0",
            )}
          >
            <path
              fill="currentColor"
              d="M10 2.2 3.6 8.6c-.5.5-.15 1.4.55 1.4H6.5v6.3c0 .5.4.9.9.9h5.2c.5 0 .9-.4.9-.9v-6.3h2.35c.7 0 1.05-.9.55-1.4L10 2.2Z"
            />
          </svg>
        </div>
      </label>
      {/* Outside <label> on purpose: keeps the field's accessible name just "Mot de passe", not this message glued on. */}
      <span
        id={`${inputId}-capslock`}
        role={capsLock ? "status" : undefined}
        className={cx(
          "mt-1 flex items-center gap-1 overflow-hidden text-xs text-warning transition-opacity duration-150",
          capsLock ? "opacity-100" : "h-0 opacity-0",
        )}
      >
        Verrouillage majuscules activé
      </span>
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </div>
  );
}
