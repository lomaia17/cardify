declare module 'nprogress' {
    interface NProgressOptions {
      minimum?: number;
      easing?: string;
      speed?: number;
      trickle?: boolean;
      trickleSpeed?: number;
      showSpinner?: boolean;
      parent?: string;
      template?: string;
    }
  
    interface NProgress {
      configure(options: NProgressOptions): void;
      start(): NProgress;
      done(force?: boolean): NProgress;
      inc(amount?: number): NProgress;
      set(n: number): NProgress;
      trickle(): NProgress;
      remove(): void;
      status: number | null;
    }
  
    const nprogress: NProgress;
    export default nprogress;
  }
  