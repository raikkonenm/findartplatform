import { Fragment } from "react";
import Link from "next/link";
import type { EditorialCreditEntity } from "@/data/editorialCredits";
import { authorHref, entityHref } from "@/lib/entitySlugs";

const linkClass = "underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-60";
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function EditorialCreditText({ text, entities = [] }: { text: string; entities?: EditorialCreditEntity[] }) {
  const named = new Map(entities.map(entity => [(entity.label ?? entity.name).toLocaleLowerCase(), entity]));
  const labels = [...named.keys()].sort((a, b) => b.length - a.length);
  if (labels.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${labels.map(escape).join("|")})`, "gi"));
  return <>{parts.map((part, index) => {
    const entity = named.get(part.toLocaleLowerCase());
    if (!entity) return <Fragment key={index}>{part}</Fragment>;
    const href = entity.kind === "author" ? authorHref(entity.name) : entityHref(entity.kind, entity.name);
    return <Link key={index} href={href} className={linkClass}>{part}</Link>;
  })}</>;
}
