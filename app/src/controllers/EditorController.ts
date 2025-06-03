import { EditorView } from "../views/EditorView";

export class EditorController {
  private editorView: EditorView;

  constructor() {
    this.editorView = new EditorView();
  }


  async EditorPage(): Promise<string> {
    return this.editorView.render();
  }

  async PublishPage(): Promise<string> {
    return this.editorView.render();
  }

  async initEditor() {
    this.editorView.initEditor();
    this.editorView.initEditorEvents();
  }
  
  async initPublish() {
    this.editorView.initEditorEvents();
  }


}
