export const config = {
    apiUrl: import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api',
    isDevelopment: import.meta.env.MODE === 'development'
}
