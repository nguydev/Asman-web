import api from '../axios.js'

export const mapService = {
  /**
   * Visible live map locations for the current viewport.
   * @param {{ north: number, south: number, east: number, west: number, zoom: number }} params
   */
  getLocations: (params) => api.get('/map/locations', { params }),
}
