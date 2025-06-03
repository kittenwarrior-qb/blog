type InputBoxType = {
  name: string;
  type: string;
  id: string;
  value?: string;
  placeholder?: string;
  icon?: string;
};

export const InputBox = ({ name, type, id, value, placeholder, icon }: InputBoxType): string => {
  return `
    <div class="relative w-full mb-4">
      <input
        name="${name}"
        type="${type}"
        placeholder="${placeholder ?? ''}"
        value="${value ?? ''}"
        id="${id}"
        class="input-box"
      />

      <i class="${icon} input-icon"></i>

      ${
        type === 'password'
          ? `<i class="fa-solid fa-eye-slash input-icon toggle-password !left-auto right-4 cursor-pointer" data-target="${id}"></i>`
          : ''
      }
    </div>
  `;
};
