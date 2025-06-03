import { AppContext } from "../models/ContextModel";
import { userNavigation } from "./userdropdown";
import { SessionModel } from "../models/SessionModel";
import toast from "../libs/toast";


export class Navbar {
  // Render navbar HTML (string)
  public render(): string {
    const isLoggedIn = !!AppContext.user.accessToken;
    return `
      <nav class="navbar">
        <div class="pr-10 d-flex items-center justify-center">
          <a class="font-gelasio font-semibold text-xl" href="#/">
            Vietnews
          </a>
        </div>

        <div data-search-box class="hide md:show absolute bg-white w-full left-0 top-full border-b border-gray-200 py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto">
          <input
            type="text"
            placeholder="Search"
            class="w-full md:w-auto bg-gray-100 p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-gray-500 text-black md:pl-12"
          />
          <i class="fa-solid fa-magnifying-glass absolute right-[10%] top-1/2 -translate-y-1/2 md:left-5 md:pointer-events-none"></i>
        </div>

        <div class="flex items-center gap-3 md:gap-6 ml-auto">
          <button id="toggleSearchBtn" class="md:hidden bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>

          <div id="editorBtn">
            <a href="#/editor" class="md:flex gap-2 link">
              <i class="fa-solid fa-pen-to-square"></i>
              Write
            </a>
          </div>

          ${
            isLoggedIn
              ? `
            <a href="#/dashboard/notification" class=" bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center">
              <i class="fa-regular fa-bell"></i>
            </a>

            <div class="relative">
              <button id="profileToggleBtn" class="w-10 h-10 mt-1">
                <img class="w-full h-full object-cover rounded-full" src="${AppContext.user.profileImg}" />
              </button>

              ${userNavigation()}
            </div>
            `
              : `
            <a href="#/login" class="btn-dark !py-2">Sign In</a>
            <a href="#/register" class="btn-light !py-2">Sign Up</a>
            `
          }
        </div>
      </nav>
    `;
  }

  // Kiểm tra thiết bị mobile
  private isMobile(): boolean {
    return window.innerWidth < 768;
  }

  // Cập nhật hiển thị search box
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

    editorBtn.style.display = this.isMobile() ? 'none' : 'block';
  }

    public initLogoutBtn() {
    const logoutBtn = document.querySelector('#logoutBtn') as HTMLButtonElement | null;
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
      SessionModel.remove("user");
      AppContext.setAccessToken(null);
      AppContext.setProfileImg(null);
      AppContext.setUsername(null);
      toast.success("Logout successful!");
      window.location.hash = "#/login";
    });
  }

  // Khởi tạo sự kiện navbar
  public init() {

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

    this.initLogoutBtn()
  }
}
