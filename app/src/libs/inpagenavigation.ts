type TabItem = {
  label: string;
  hiddenOnDesktop?: boolean;
};

export const InPageNavigation = (tabs: TabItem[], id: string): string => {
  const buttonsHtml = tabs
    .map((tab, i) => {
      const visibilityClass = tab.hiddenOnDesktop ? 'block md:hidden' : 'block';
      const textClass = i === 0 ? 'text-black' : 'text-gray-400';

      return `
        <button 
          data-index="${i}" 
          class="nav-tab-${id} ${visibilityClass} !p-4 !px-5 capitalize ${textClass}"
        >
          ${tab.label}
        </button>
      `;
    })
    .join('');

  const activeLineHtml = `
    <div id="active-line-${id}" class="absolute bottom-0 h-[2px] w-[80px] bg-black transition-all duration-300"></div>
  `;

  return `
    <div id="${id}" class="relative !mb-8 bg-white border-b border-gray-200 flex flex-nowrap overflow-x-auto">
      ${buttonsHtml}
      ${activeLineHtml}
    </div>
  `;
};

export const initInPageNavigation = (id: string): void => {
  const container = document.getElementById(id);
  if (!container) return;

  const buttons = container.querySelectorAll<HTMLButtonElement>(`.nav-tab-${id}`);
  const activeLine = document.getElementById(`active-line-${id}`);
  const contentContainer = document.getElementById(`${id}-contents`);
  if (!activeLine || buttons.length === 0 || !contentContainer) return;

  // Hàm chuẩn hóa label thành id-friendly
  const toId = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

  const updateActiveLine = (btn: HTMLButtonElement) => {
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = btnRect.left - containerRect.left;

    activeLine.style.transform = `translateX(${left}px)`;
    activeLine.style.width = `${btn.offsetWidth}px`;
  };

  // Hàm kích hoạt content theo id
  const activateTab = (contentId: string) => {
    const allContents = contentContainer.querySelectorAll<HTMLElement>('.tab-content');
    allContents.forEach(item => {
      if (item.id === contentId) {
        item.classList.remove('hidden');
        item.classList.add('block');
      } else {
        item.classList.remove('block');
        item.classList.add('hidden');
      }
    });
  };

  const setActiveButton = (btn: HTMLButtonElement) => {
    buttons.forEach(b => {
      b.classList.remove("text-black");
      b.classList.add("text-gray-400");
    });

    btn.classList.add("text-black");
    btn.classList.remove("text-gray-400");

    updateActiveLine(btn);
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveButton(btn);

      // Lấy label từ data-label hoặc textContent
      const label = btn.dataset.label || btn.textContent || '';
      const contentId = `content-${toId(label.trim())}`;

      activateTab(contentId);
    });
  });

  // Mặc định active tab đầu tiên khi load trang
  window.addEventListener("load", () => {
    setActiveButton(buttons[0]);

    const label = buttons[0].dataset.label || buttons[0].textContent || '';
    activateTab(`content-${toId(label.trim())}`);
  });

  // Bắt sự kiện resize - nếu width >= 768 (md), chuyển về tab 0
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      setActiveButton(buttons[0]);

      const label = buttons[0].dataset.label || buttons[0].textContent || '';
      activateTab(`content-${toId(label.trim())}`);
    }
  });
};



