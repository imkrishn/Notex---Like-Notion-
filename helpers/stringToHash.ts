export function stringToRandomColor(str: string) {
  let hash = 0;
  const randomSalt = Math.floor(Math.random() * 10000);

  // Hash the string with the random salt
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash) + randomSalt;
  }

  // Convert hash to RGB
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += value.toString(16).padStart(2, '0');
  }

  return color;
}
