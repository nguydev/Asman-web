/**
 * Normalizes frontend address objects to match the backend AddressDto.
 * The backend expects: street, city, state, zipCode, latitude, longitude.
 * It does not store 'country' or 'line1'.
 */
export const normalizeAddress = (address) => {
  if (!address) return undefined;

  // We should preserve empty strings so the backend knows to clear the field.
  // We only drop if it's strictly undefined or null.
  const street = address.street ?? address.line1;
  const city = address.city;
  const state = address.state;
  const zipCode = address.zipCode ?? address.postalCode;
  const latitude = address.latitude;
  const longitude = address.longitude;

  // If literally every field is undefined/null (not even empty strings), then we have no address at all
  if (street == null && city == null && state == null && zipCode == null && latitude == null && longitude == null) {
    return undefined;
  }

  return {
    street: street != null ? String(street).trim() : undefined,
    city: city != null ? String(city).trim() : undefined,
    state: state != null ? String(state).trim() : undefined,
    zipCode: zipCode != null ? String(zipCode).trim() : undefined,
    latitude: latitude != null ? String(latitude).trim() : undefined,
    longitude: longitude != null ? String(longitude).trim() : undefined
  };
};

/**
 * Parses backend Address object to frontend UI format.
 */
export const parseAddress = (address) => {
  if (!address) return { line1: '', city: '', state: '', zipCode: '', country: '' };
  
  return {
    line1: address.street || '',
    city: address.city || '',
    state: address.state || '',
    zipCode: address.zipCode || '',
    country: '' // Backend currently does not store country
  };
};
