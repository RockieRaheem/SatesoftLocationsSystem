
const fs = require('fs');

const content = fs.readFileSync('africaPaths.ts', 'utf8');
const match = content.match(/export const africaDetailedPaths = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('Could not find africaDetailedPaths');
    process.exit(1);
}

const paths = eval(match[1]);

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

paths.forEach(p => {
    const d = p.d;
    const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (coords) {
        for (let i = 0; i < coords.length; i += 2) {
            const x = parseFloat(coords[i]);
            const y = parseFloat(coords[i+1]);
            if (!isNaN(x) && !isNaN(y)) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
});

console.log(`Bounding Box: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);
console.log(`Width: ${maxX - minX}, Height: ${maxY - minY}`);
