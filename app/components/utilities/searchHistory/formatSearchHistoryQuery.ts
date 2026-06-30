export function capitalizeFirstLetter(query: string) {
  return query.replace(/[A-Za-z]/, (letter) => letter.toUpperCase());
}
