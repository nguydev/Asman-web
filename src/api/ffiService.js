const FFI_GRAPHQL_URL =
  import.meta.env.VITE_FFI_GRAPHQL_URL || '/ffi/api/graphql'

const GET_DETENTION_CENTERS = `
  query GetDetentionCenters {
    detentionCenters {
      id
      name
      address
      latitude
      longitude
      website
      phoneNumber
      facilityOwner {
        id
        name
      }
      facilityType {
        id
        name
        description
        typeCode
        detailCode
      }
      facilityOperator {
        id
        name
      }
      iceFieldOffice {
        id
        name
        address
      }
      policies
      createdAt
      updatedAt
    }
  }
`

/** Bucket used by Intelligence Hub capacity/type filters. */
export function ffiTypeBucket(center) {
  const code = (center.typeCode || '').toUpperCase()
  const detail = (center.detailCode || '').toUpperCase()
  if (
    code === 'CDF' ||
    detail === 'CDF' ||
    detail === 'DIGSA' ||
    detail === 'SPC' ||
    detail === 'FAMILY' ||
    detail === 'STAGING'
  ) {
    return 'dedicated'
  }
  if (code === 'IGSA' || detail === 'IGSA' || detail === 'JUVENILE') {
    return 'igsa'
  }
  if (code.includes('USMS') || detail.includes('USMS')) {
    return 'usms'
  }
  if (code === 'BOP' || code === 'DOD' || detail === 'BOP' || detail === 'DOD') {
    return 'federal'
  }
  return 'other'
}

export function ffiFacColor(bucket) {
  switch (bucket) {
    case 'dedicated':
      return '#FF4757'
    case 'igsa':
      return '#FF6B35'
    case 'usms':
      return '#E8C547'
    case 'federal':
      return '#3D9BFF'
    default:
      return '#8892A4'
  }
}

export function mapFfiDetentionCenter(raw) {
  const lat = Number(raw.latitude)
  const lng = Number(raw.longitude)
  const typeCode = raw.facilityType?.typeCode || null
  const detailCode = raw.facilityType?.detailCode || null
  const mapped = {
    id: `ffi-${raw.id}`,
    sourceId: String(raw.id),
    name: raw.name || 'Detention center',
    address: raw.address || null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    website: raw.website || null,
    phone: raw.phoneNumber || null,
    typeCode,
    detailCode,
    typeName: raw.facilityType?.name || null,
    typeDescription: raw.facilityType?.description || null,
    op: raw.facilityOperator?.name || raw.facilityOwner?.name || null,
    owner: raw.facilityOwner?.name || null,
    iceFieldOffice: raw.iceFieldOffice?.name || null,
    iceFieldOfficeAddress: raw.iceFieldOffice?.address || null,
    status: 'active',
    source: 'freedom-for-immigrants',
  }
  mapped.bucket = ffiTypeBucket(mapped)
  mapped.color = ffiFacColor(mapped.bucket)
  return mapped
}

export async function fetchDetentionCenters() {
  const response = await fetch(FFI_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      operationName: 'GetDetentionCenters',
      variables: {},
      query: GET_DETENTION_CENTERS,
    }),
  })

  if (!response.ok) {
    throw new Error(`FFI GraphQL failed: ${response.status}`)
  }

  const json = await response.json()
  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message || 'FFI GraphQL error')
  }

  const rows = json?.data?.detentionCenters
  if (!Array.isArray(rows)) return []

  return rows
    .map(mapFfiDetentionCenter)
    .filter((c) => c.lat != null && c.lng != null)
}
