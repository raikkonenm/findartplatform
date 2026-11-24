import type { EditorialSelection } from "@/data/editorialSelections";
import { EditorialEssayArticle } from "./EditorialEssayArticle";
import { EditorialSelectionArticle } from "./EditorialSelectionArticle";
import { ArtistEditorialSelectionArticle } from "./ArtistEditorialSelectionArticle";
import { OpportunityEditorialSelectionArticle } from "./OpportunityEditorialSelectionArticle";

export function EditorialArticleContent({ selection }: { selection: EditorialSelection }) {
  if (selection.kind === "opportunities") return <OpportunityEditorialSelectionArticle selection={selection} />;
  if (selection.kind === "essay") return <EditorialEssayArticle selection={selection} />;
  if (selection.kind === "artists") return <ArtistEditorialSelectionArticle selection={selection} />;
  return <EditorialSelectionArticle selection={selection} />;
}
