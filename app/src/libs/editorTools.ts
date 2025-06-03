import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import CodeTool from '@editorjs/code';

const uploadImageByUrl = async (url: string) => {
  return {
    success: 1,
    file: { url }
  };
};

const uploadImageByFile = async (file: File) => {
  const url = URL.createObjectURL(file);
  return {
    success: 1,
    file: { url }
  };
};

export const editorTools: Record<string, any> = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        uploadByFile: uploadImageByFile,
        uploadByUrl: uploadImageByUrl
      }
    }
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type heading...",
      levels: [2, 3],
      defaultLevel: 2
    }
  },
  quote: {
    class: Quote,
    inlineToolbar: true
  },
  marker: {
    class: Marker
  },
  inlineCode: {
    class: InlineCode
  },
  linkTool: {
    class: LinkTool
  },
  code: {
    class: CodeTool
  }
};
