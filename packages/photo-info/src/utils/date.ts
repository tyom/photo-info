/**
 * Reformats a date string from the format "YYYY:MM:DD HH:MM:SS" found in EXIF data to "YYYY-MM-DDTHH:MM:SS".
 * @param input
 */
export function reformatDate(input: string | null): string | null {
  if (!input) return null;

  const [date, time] = input.split(' ');
  const formattedDate = date.replace(/:/g, '-');
  return `${formattedDate}T${time}`;
}
