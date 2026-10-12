import { AsYouType, parsePhoneNumber } from 'libphonenumber-js/max'

/**
 * Same rule as Nest class-validator `@IsPhoneNumber()` (no region):
 * the value must parse as a valid number with a country calling code.
 */
export function isPhoneNumber(value) {
  if (typeof value !== 'string' || value.trim() !== value) return false
  try {
    return parsePhoneNumber(value).isValid()
  } catch {
    return false
  }
}

/**
 * Form input: empty is allowed (optional fields). National numbers are
 * parsed with `defaultCountry`; values starting with `+` are international.
 */
export function isValidPhoneInput(value, defaultCountry = 'US') {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return true
  try {
    const parsed = trimmed.startsWith('+')
      ? parsePhoneNumber(trimmed)
      : parsePhoneNumber(trimmed, defaultCountry)
    return parsed.isValid()
  } catch {
    return false
  }
}

/** E.164 for the API — what `@IsPhoneNumber()` on the backend expects. */
export function toE164(value, defaultCountry = 'US') {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) return ''
  try {
    const parsed = trimmed.startsWith('+')
      ? parsePhoneNumber(trimmed)
      : parsePhoneNumber(trimmed, defaultCountry)
    return parsed.number
  } catch {
    return ''
  }
}

export function formatPhoneInput(raw, defaultCountry = 'US') {
  return new AsYouType(defaultCountry).input(raw ?? '')
}
