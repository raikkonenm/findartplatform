export function displayExhibitionTitle(title: string): string {
  return title.replace(/ ?\(GROUP EXHIBITION\)/g, "");
}
