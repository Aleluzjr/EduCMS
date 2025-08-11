type RefreshFunction = () => Promise<void>;

interface QueuedRefresh {
  resolve: (value: void | PromiseLike<void>) => void;
  reject: (reason?: any) => void;
}

export class RefreshManager {
  private static instance: RefreshManager;
  private isRefreshing = false;
  private queue: QueuedRefresh[] = [];

  static getInstance(): RefreshManager {
    if (!RefreshManager.instance) {
      RefreshManager.instance = new RefreshManager();
    }
    return RefreshManager.instance;
  }

  async runOnce(fn: RefreshFunction): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    this.queue = [];

    try {
      await fn();
      this.resolveQueue();
    } catch (error) {
      this.rejectQueue(error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private resolveQueue(): void {
    this.queue.forEach(({ resolve }) => resolve());
    this.queue = [];
  }

  private rejectQueue(error: any): void {
    this.queue.forEach(({ reject }) => reject(error));
    this.queue = [];
  }

  reset(): void {
    this.isRefreshing = false;
    this.queue.forEach(({ reject }) => reject(new Error('Refresh resetado')));
    this.queue = [];
  }
}
