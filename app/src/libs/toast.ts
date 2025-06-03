type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

type ToastDetail = {
  icon?: string;
  text?: string;
};

const toastDetails: Record<Exclude<ToastType, 'loading'>, ToastDetail> = {
  success: { icon: 'fa-circle-check', text: 'Success: This is a success toast.' },
  error: { icon: 'fa-circle-xmark', text: 'Error: This is an error toast.' },
  warning: { icon: 'fa-triangle-exclamation', text: 'Warning: This is a warning toast.' },
  info: { icon: 'fa-circle-info', text: 'Info: This is an information toast.' }
};

class Toast {
  private container: HTMLElement | null;
  private loadingToast: HTMLElement | null = null;
  private timer = 5000;

  constructor() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('ul');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  private removeToast(toast: HTMLElement) {
    toast.classList.add('hide');
    if ((toast as any).timeoutId) clearTimeout((toast as any).timeoutId);
    setTimeout(() => toast.remove(), 300);
  }

  private createToast(type: Exclude<ToastType, 'loading'>, message?: string) {
    if (!this.container || !toastDetails[type]) return;

    const { icon, text } = toastDetails[type];
    const msg = message || text || '';

    const toast = document.createElement('li');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fa-solid ${icon}"></i>
        <span>${msg}</span>
      </div>
      <i class="fa-solid fa-xmark toast-close"></i>
    `;

    const closeBtn = toast.querySelector('.toast-close') as HTMLElement;
    closeBtn.onclick = () => this.removeToast(toast);

    (toast as any).timeoutId = setTimeout(() => this.removeToast(toast), this.timer);

    this.container.appendChild(toast);
  }

  success(message?: string) {
    this.createToast('success', message);
  }

  error(message?: string) {
    this.createToast('error', message);
  }

  warning(message?: string) {
    this.createToast('warning', message);
  }

  info(message?: string) {
    this.createToast('info', message);
  }

  loading(message?: string) {
    if (!this.container) return;

    if (this.loadingToast) {
      this.removeToast(this.loadingToast);
      this.loadingToast = null;
    }

    const msg = message || 'Loading...';

    const toast = document.createElement('li');
    toast.className = 'toast loading';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>${msg}</span>
      </div>
    `;

    this.container.appendChild(toast);
    this.loadingToast = toast;
  }

  dismissLoading() {
    if (this.loadingToast) {
      this.removeToast(this.loadingToast);
      this.loadingToast = null;
    }
  }
}

// export 1 instance để dùng
const toast = new Toast();
export default toast;
