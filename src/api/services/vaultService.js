import api from '../axios.js'

export const vaultService = {
  addCaseDocument: (caseId, fileObjectId) =>
    api.post('/admin/vault/documents', {
      fileObjectId,
      targetType: 'CASE',
      targetId: caseId,
    }),
  deleteDocument: (id) => api.delete(`/admin/vault/documents/${id}`),
}
