import { cn } from "@/lib/utils";

export default function Container({ children, className }) {
  const containerClasses = cn(
    "mx-auto",
    "max-w-[1400px]",
    "px-4",
    "py-5",
    "lg:py-8",
    className,
  );

  return <div className={containerClasses}>{children}</div>;
}
