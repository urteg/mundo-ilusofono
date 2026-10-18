import { twMerge } from "tailwind-merge";

/** Junta classes; em conflito (ex.: p-5 e p-0), vale a última. */
export function cx(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}
