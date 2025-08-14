export const getAssetUrl = (relativePath) => {
  const base = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '').replace(/\/$/, '');
  const cleaned = String(relativePath || '').replace(/^\/+/, '');
  if (base) return `${base}/${cleaned}`;
  return `/${cleaned}`;
};


