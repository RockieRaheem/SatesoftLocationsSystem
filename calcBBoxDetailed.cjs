const { africaDetailedPaths } = require('./africaPaths.ts');

africaDetailedPaths.forEach(path => {
  if (path.id === 'TZ' || path.id === 'RW') {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const d = path.d;
    const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (coords) {
      for (let i = 0; i < coords.length; i += 2) {
        const x = parseFloat(coords[i]);
        const y = parseFloat(coords[i+1]);
        if (!isNaN(x) && !isNaN(y)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`${path.id}:`, { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY });
  }
});
