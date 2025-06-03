export type ParagraphBlock = {
  type: "paragraph";
  data: {
    text: string;
  };
};

export type HeaderBlock = {
  type: "header";
  data: {
    level: number;
    text: string;
  };
};

export type ImageBlock = {
  type: "image";
  data: {
    file: { url: string };
    caption: string;
  };
};

export type QuoteBlock = {
  type: "quote";
  data: {
    text: string;
    caption: string;
  };
};

export type ListBlock = {
  type: "list";
  data: {
    style: "ordered" | "unordered";
    items: string[];
  };
};

export type ContentBlock = ParagraphBlock | HeaderBlock | ImageBlock | QuoteBlock | ListBlock;


export function renderContentBlock(block: ContentBlock): string {
  switch (block.type) {
    case "paragraph":
      return `<p class="!mb-3 text-xl">${block.data.text}</p>`;
    case "header":
      if (block.data.level === 3) {
        return `<h3 class="text-3xl font-bold">${block.data.text}</h3>`;
      }
      return `<h2 class="text-4xl font-bold">${block.data.text}</h2>`;
    case "image":
      return `
        <div class="w-full">
          <img class="w-full" src="${block.data.file.url}" alt="${block.data.caption || ""}" />
          ${
            block.data.caption && block.data.caption.length
              ? `<p class="!mt-3 w-full text-center my-3 md:mb-12 text-base text-gray-400">${block.data.caption}</p>`
              : ""
          }
        </div>
      `;
    case "quote":
      return `
        <div class="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
          <p class="text-xl leading-10 md:text-2xl">${block.data.text}</p>
          ${
            block.data.caption && block.data.caption.length
              ? `<p class="w-full text-purple text-base">${block.data.caption}</p>`
              : ""
          }
        </div>
      `;
    case "list":
      const listTag = block.data.style === "ordered" ? "ol" : "ul";
      const itemsHtml = block.data.items.map(item => `<li class="my-4">${item}</li>`).join("");
      return `<${listTag} class="pl-5 ${
        block.data.style === "ordered" ? "list-decimal" : "list-disc"
      }">${itemsHtml}</${listTag}>`;
    default:
      return "";
  }
}
