export const SERVICES = [
  { key: 'corte', label: 'Corte' },
  { key: 'barba', label: 'Barba' },
  { key: 'combo', label: 'Combo' },
]

export const PROMOS = [
  { key: 'promo2', label: 'Promoción 2 Cortes/mes', qty: 2 },
  { key: 'promo3', label: 'Promoción 3 Cortes/mes', qty: 3 },
  { key: 'promo4', label: 'Promoción 4 Cortes/mes', qty: 4 },
]

export function findPriceRow(prices, promoType, serviceType) {
  return prices.find(
    (row) => row.promo_type === promoType && row.service_type === serviceType,
  )
}

export const PROMO_TYPES = [{ key: 'normal', label: 'Sin promoción' }, ...PROMOS]

export function serviceLabel(key) {
  return SERVICES.find((s) => s.key === key)?.label ?? key
}

export function promoLabel(key) {
  return PROMO_TYPES.find((p) => p.key === key)?.label ?? key
}
