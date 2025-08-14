const buildSupabasePublicBase = () => {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  if (!supabaseUrl) return '';
  const bucket = (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'assets').trim();
  try {
    const url = new URL(supabaseUrl);
    const origin = `${url.protocol}//${url.hostname}`;
    return `${origin}/storage/v1/object/public/${bucket}`;
  } catch (_) {
    return '';
  }
};

export const getAssetUrl = (relativePath) => {
  const configured = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '').replace(/\/$/, '');
  const fallback = buildSupabasePublicBase();
  const base = configured || fallback;
  const cleaned = String(relativePath || '').replace(/^\/+/, '');
  if (base) return `${base}/${cleaned}`;
  return `/${cleaned}`;
};


