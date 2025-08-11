export class RefreshScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;

  scheduleRefresh(accessToken: string, onFire: () => void): () => void {
    this.cancel();
    
    const msUntilRefresh = this.calculateRefreshTime(accessToken);
    
    this.timer = setTimeout(() => {
      onFire();
    }, msUntilRefresh);

    return this.cancel.bind(this);
  }

  private calculateRefreshTime(accessToken: string): number {
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Agendar refresh 5 minutos antes da expiração
      return Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000);
    } catch (error) {
      // Fallback: agendar refresh em 23 horas
      return 23 * 60 * 60 * 1000;
    }
  }

  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
