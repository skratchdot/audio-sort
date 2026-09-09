import { createLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "@/utilities/cn";

export function TextLink({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "text-sky-700 underline-offset-4 hover:text-sky-800 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export const AppLink = createLink(TextLink);
