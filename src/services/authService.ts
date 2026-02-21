const AUTH_KEY = 'auth_token';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(AUTH_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(AUTH_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(AUTH_KEY);
  },
  getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
  getAuthHeadersForFormData(): HeadersInit {
    const token = authService.getToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
};

export default authService;
