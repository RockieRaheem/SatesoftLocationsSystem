import fs from 'fs';

async function main() {
  const url = "https://upload.wikimedia.org/wikipedia/commons/b/b3/Tanzania,_administrative_divisions_-_de_-_colored.svg";
  console.log("Fetching SVG from:", url);
  const response = await fetch(url);
  const text = await response.text();
  console.log("Fetched SVG length:", text.length);
  fs.writeFileSync("tz_temp.svg", text);
  console.log("Saved to tz_temp.svg");

  if (text.length < 1000) {
    console.log("Content:", text);
    return;
  }

  // Let's count some elements
  const pathCount = (text.match(/<path/g) || []).length;
  console.log("Path count:", pathCount);
  const textCount = (text.match(/<text/g) || []).length;
  console.log("Text count:", textCount);
}

main().catch(console.error);
