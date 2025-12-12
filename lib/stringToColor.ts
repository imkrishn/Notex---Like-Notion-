function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash = hash & 0x00ffffff;

  const color = ("000000" + hash.toString(16).toUpperCase()).slice(-6);

  return "#" + color;
}

export default stringToColor;
