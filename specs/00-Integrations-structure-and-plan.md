Read `AGENTS.md` file before starting.
## 1. Environment variables

Create `.env.development` and `.env.production` at project root (not `src/`):

```
# .env.development
VITE_API_BASE_URL=http://localhost:5000/api

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

Vite only exposes vars prefixed with `VITE_`. Access via `import.meta.env.VITE_API_BASE_URL`.

Add `.env*.local` to `.gitignore` (keep `.env.example` committed for team reference).

## 2. Dev-time proxy (avoids CORS pain in local dev)

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

With this, you can call `fetch('/api/users')` in dev and it proxies to your backend — no CORS headers needed locally. In production, your backend still needs proper CORS config (or you serve frontend + backend from the same origin/reverse proxy).

## 3. Centralized API client (axios)

```bash
npm install axios
```

```js
// src/api/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// Attach auth token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling / token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // e.g. redirect to login, or attempt token refresh
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

## 4. Feature-based service layer (don't call axios directly in components)

```js
// src/api/services/userService.js
import api from '../axios'

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}
```

## 5. Data fetching with React Query (industry standard over raw useEffect)

```bash
npm install @tanstack/react-query
```

```jsx
// src/main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

```jsx
// src/features/users/hooks/useUsers.js
import { useQuery } from '@tanstack/react-query'
import { userService } from '../../../api/services/userService'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => (await userService.getAll()).data,
  })
}
```

```jsx
// Component usage
function UserList() {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

## 6. Suggested folder structure

```
src/
  api/
    axios.js
    services/
      userService.js
      authService.js
  features/
    users/
      hooks/
      components/
    auth/
  components/       # shared/reusable UI
  pages/
  hooks/
  utils/
  main.jsx
  App.jsx
```

## Key points to decide based on your stack

- We have the Cookies supported.
- **Same-origin in prod**: many teams serve frontend build + backend behind the same domain (via Nginx/reverse proxy) to sidestep CORS entirely.
