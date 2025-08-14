import fs from 'fs';
import path from 'path';
import https from 'https';

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;
const ICON_NAME_PREFIX = process.env.FIGMA_ICON_PREFIX || 'fa-';
const ICON_PAGE = process.env.FIGMA_ICON_PAGE || '';
const OUTPUT_DIR = process.env.ICON_OUTPUT_DIR || 'public/icons';

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error('Missing FIGMA_TOKEN or FIGMA_FILE_KEY in env');
  process.exit(1);
}

const figmaFetch = async (urlPath) => {
  const url = `https://api.figma.com/v1${urlPath}`;
  const res = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error ${res.status}: ${text}`);
  }
  return res.json();
};

const listComponentNodes = (document, nodes = [], inIconPage = !ICON_PAGE) => {
  if (!document) return nodes;
  const { name = '', type, id, children = [] } = document;
  let allowed = inIconPage;
  if (ICON_PAGE && type === 'CANVAS') {
    allowed = name.trim().toLowerCase() === ICON_PAGE.trim().toLowerCase();
  }
  if (allowed && (type === 'COMPONENT' || type === 'COMPONENT_SET' || type === 'INSTANCE')) {
    if (name.toLowerCase().startsWith(ICON_NAME_PREFIX.toLowerCase())) {
      nodes.push({ id, name });
    }
  }
  for (const child of children) listComponentNodes(child, nodes, allowed);
  return nodes;
};

const download = (url, dest) => new Promise((resolve, reject) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      file.close();
      fs.unlink(dest, () => {});
      reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      return;
    }
    response.pipe(file);
    file.on('finish', () => file.close(resolve));
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    reject(err);
  });
});

const main = async () => {
  console.log('Fetching Figma file...');
  const file = await figmaFetch(`/files/${FIGMA_FILE_KEY}`);
  const nodes = listComponentNodes(file.document);
  if (nodes.length === 0) {
    console.warn('No matching icon components found. Check FIGMA_ICON_PREFIX and FIGMA_ICON_PAGE.');
    return;
  }
  console.log(`Found ${nodes.length} icon nodes`);

  // Figma image export API (SVG)
  const ids = nodes.map(n => n.id).join(',');
  const { images } = await figmaFetch(`/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg`);
  const entries = Object.entries(images || {});
  if (entries.length === 0) {
    console.warn('Figma returned no image URLs.');
    return;
  }

  for (const [nodeId, url] of entries) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !url) continue;
    const safeName = node.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/^fa-+/, 'fa-');
    const dest = path.join(OUTPUT_DIR, `${safeName}.svg`);
    console.log(`Downloading ${safeName} -> ${dest}`);
    await download(url, dest);
  }
  console.log('Done.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

