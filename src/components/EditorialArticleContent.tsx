import type { EditorialSelection } from "@/data/editorialSelections";
import { EditorialEssayArticle } from "./EditorialEssayArticle";
import { EditorialSelectionArticle } from "./EditorialSelectionArticle";
import { ArtistEditorialSelectionArticle } from "./ArtistEditorialSelectionArticle";

export function EditorialArticleContent({ selection }: { selection: EditorialSelection }) {
  if (selection.kind === "essay") return <EditorialEssayArticle selection={selection} />;
  if (selection.kind === "artists") return <ArtistEditorialSelectionArticle selection={selection} />;
  return <EditorialSelectionArticle selection={selection} />;
}
