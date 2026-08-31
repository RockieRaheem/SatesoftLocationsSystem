
import { africaDetailedPaths } from './africaPaths';

const ids = africaDetailedPaths.map(p => p.id);
const uniqueIds = new Set(ids);

if (ids.length !== uniqueIds.size) {
  console.log('Duplicate IDs found!');
  const counts: Record<string, number> = {};
  ids.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });
  Object.entries(counts).forEach(([id, count]) => {
    if (count > 1) {
      console.log(`ID: ${id}, Count: ${count}`);
    }
  });
} else {
  console.log('No duplicate IDs found in africaDetailedPaths.');
}
