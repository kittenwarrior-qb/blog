import { Navbar } from "../components/navbar";

const navbar = new Navbar();

export class Layout {
  mainLayout(content: string) {
    return `
      <div>
        ${navbar.render()}
        <main>${content}</main>
      </div>
    `;
  }

  noNavLayout(content: string) {
    return `
      ${content}
    `;
  }

  adminLayout(content: string) {
    return `
      <div>
        <main>${content}</main>
      </div>
    `;
  }

  initNavbar() {
    navbar.init();
  }
}
