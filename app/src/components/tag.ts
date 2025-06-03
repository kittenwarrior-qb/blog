export const Tag = (tag: string) => {
  return `
    <div class="tag-item relative !p-2 !mt-2 !mr-2 !px-5 !bg-white rounded-full inline-block hover:bg-opacity-50 !pr-8">
      <p class="outline-none" contentEditable="true">${tag}</p>
      <button
        class="tag-delete-btn !mt-[2px] rounded-full absolute !right-3 !top-1/2 -translate-y-1/2"
      >
        <i class="fa-solid fa-xmark text-sm pointer-events-none"></i>
      </button>     
    </div>
  `;
};
