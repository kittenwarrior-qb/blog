export class Ui {
  constructor() {
    this.initTogglePassword();
    this.initNavbarEvents();
  }

  public initTogglePassword() {
    document.querySelectorAll('.toggle-password').forEach((icon) => {
      icon.addEventListener('click', () => {
        const targetId = (icon as HTMLElement).dataset.target;
        const input = document.getElementById(targetId!) as HTMLInputElement;

        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';

          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
        }
      });
    });
  }

  private isMobile(): boolean {
    return window.innerWidth < 768;
  }

  private updateSearchBoxVisibility() {
    const searchBox = document.querySelector('[data-search-box]') as HTMLElement | null;
    if (!searchBox) return;

    if (this.isMobile()) {
      searchBox.classList.add('hide');
      searchBox.classList.remove('show');
    } else {
      searchBox.classList.add('show');
      searchBox.classList.remove('hide');
    }
  }

  private updateEditorBtnVisibility() {
    const editorBtn = document.getElementById('editorBtn') as HTMLDivElement | null;
    if (!editorBtn) return;

    if (this.isMobile()) {
      editorBtn.style.display = 'none';
    } else {
      editorBtn.style.display = 'block';
    }
  }

  public initNavbarEvents() {
    const toggleBtn = document.getElementById('toggleSearchBtn');
    const profileToggleBtn = document.getElementById('profileToggleBtn');
    const userDropdown = document.getElementById('userDropdown');

    const searchBox = document.querySelector('[data-search-box]') as HTMLElement | null;

    if (toggleBtn && searchBox) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.isMobile()) return;

        if (searchBox.classList.contains('hide')) {
          searchBox.classList.remove('hide');
          searchBox.classList.add('show');
        } else {
          searchBox.classList.remove('show');
          searchBox.classList.add('hide');
        }
      });
    }

    this.updateSearchBoxVisibility();
    this.updateEditorBtnVisibility();

    window.addEventListener('resize', () => {
      this.updateSearchBoxVisibility();
      this.updateEditorBtnVisibility();
    });

    if (profileToggleBtn && userDropdown) {
      profileToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (
          !userDropdown.contains(e.target as Node) &&
          !profileToggleBtn.contains(e.target as Node)
        ) {
          userDropdown.classList.add('hidden');
        }
      });
    }
  }
}
