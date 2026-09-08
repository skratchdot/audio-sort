import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { ComponentProps } from "react";

export function OptionButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-sky-700 hover:bg-white hover:text-sky-800 focus-visible:bg-white focus-visible:text-sky-800 aria-pressed:bg-sky-700 aria-pressed:text-white aria-pressed:hover:bg-sky-800 aria-pressed:focus-visible:bg-sky-800 aria-pressed:focus-visible:text-white",
        className,
      )}
      {...props}
    />
  );
}
