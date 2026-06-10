// GoatCounter integration. The site code must exist as an account at
// https://<code>.goatcounter.com (Settings: allow the counter.json endpoint).
// Every consumer treats null as "omit the views UI" — never show 0 or a placeholder.
export const GOATCOUNTER_CODE = 'harshpavuluri'

export function parseCount(data) {
  if (!data || typeof data.count !== 'string') return null
  const digits = data.count.replace(/\D/g, '')
  return digits ? Number(digits) : null
}

// Resolves to a number, or null on any failure. Pass 'TOTAL' for site-wide views.
export async function fetchViewCount(path) {
  try {
    const res = await fetch(
      `https://${GOATCOUNTER_CODE}.goatcounter.com/counter/${encodeURIComponent(path)}.json`,
    )
    if (!res.ok) return null
    return parseCount(await res.json())
  } catch {
    return null
  }
}
