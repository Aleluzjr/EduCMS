interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export const jwtUtils = {
  decode: (token: string): JwtPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  getExpiration: (token: string): number | null => {
    const payload = jwtUtils.decode(token);
    return payload?.exp ? payload.exp * 1000 : null;
  },

  msUntilExpiry: (token: string, skewMs: number = 300000): number | null => {
    const exp = jwtUtils.getExpiration(token);
    if (!exp) return null;
    
    const now = Date.now();
    const timeUntilExpiry = exp - now;
    return Math.max(timeUntilExpiry - skewMs, 60000); // Mínimo 1 minuto
  },

  isExpired: (token: string): boolean => {
    const exp = jwtUtils.getExpiration(token);
    if (!exp) return true;
    return Date.now() >= exp;
  }
};
