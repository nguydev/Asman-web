import { organizationService } from './organizationService.js'
import { unwrapApiData } from './driverService.js'

export async function getCurrentOrganizationId() {
  const orgsRes = await organizationService.getOrganizations({ limit: 1 })
  const orgs = unwrapApiData(orgsRes)
  const orgId = Array.isArray(orgs) ? orgs[0]?.id : orgs?.items?.[0]?.id
  if (!orgId) throw new Error('No organization found')
  return orgId
}
