import { Layout } from "./layouts";
import { HomeController } from "./controllers/HomeController";
import { AuthController } from "./controllers/AuthController";
import { EditorController } from "./controllers/EditorController";
import { AdminController } from "./controllers/AdminController";

// Type params hỗ trợ cả query
type RouteParams = Record<string, string> & { query?: URLSearchParams };

// Layout
const layouts = new Layout();

// Controllers
const homeController = new HomeController();
const authController = new AuthController();
const editorController = new EditorController();
const adminController = new AdminController();

const routes: {
  pattern: RegExp;
  render: (params?: RouteParams) => Promise<string> | string;
  layout: (content: string) => string;
  afterRender?: (params?: RouteParams) => void;
}[] = [
  {
    pattern: /^\/$/,
    render: () => homeController.HomePage(),
    layout: layouts.mainLayout,
  },
  {
    pattern: /^\/login$/,
    render: () => authController.LoginPage(),
    layout: layouts.mainLayout,
    afterRender: () => authController.initAuthFormEvents("login"),
  },
  {
    pattern: /^\/forgot-password$/,
    render: () => authController.ForgotPasswordPage(),
    layout: layouts.mainLayout,
    afterRender: () => authController.initForgotPasswordFormEvents(),
  },
  {
    pattern: /^\/reset-password$/,
    render: () => {
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      const token = params.get("token") || "";
      return authController.ResetPasswordPage(token);
    },
    layout: layouts.mainLayout,
    afterRender: () => {
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      const token = params.get("token") || "";
      authController.initResetPasswordFormEvents(token);
      authController.initTogglePassword();
    },
  },
  {
    pattern: /^\/register$/,
    render: () => authController.RegisterPage(),
    layout: layouts.mainLayout,
    afterRender: () => authController.initAuthFormEvents("register"),
  },
  {
    pattern: /^\/editor$/,
    render: () => editorController.EditorPage(),
    layout: layouts.noNavLayout,
    afterRender: () => {
      editorController.initEditor();
    },
  },
  {
    pattern: /^\/publish$/,
    render: () => editorController.PublishPage(),
    layout: layouts.noNavLayout,
    afterRender: () => editorController.initPublish(),
  },
  {
    pattern: /^\/blog\/(?<id>[a-zA-Z0-9\-]+)$/,
    render: (params) => {
      if (!params || !params.id) {
        return Promise.resolve(`not found blog id`);
      }
      return homeController.BlogDetailPage(params.id);
    },
    layout: layouts.mainLayout,
  },
  {
    pattern: /^\/admin$/,
    render: () => adminController.AdminPage(),
    layout: layouts.adminLayout,
  },
  {
    pattern: /^\/admin\/blogs$/,
    render: () => adminController.AdminBlogPage(),
    layout: layouts.adminLayout,
    // afterRender: () => adminController.
  },
];

export const router = async () => {
  const fullHash = window.location.hash.replace("#", "") || "/";
  const [rawPath, queryString] = fullHash.split("?");
  const queryParams = new URLSearchParams(queryString);

  const app = document.getElementById("app");
  if (!app) return;

  if (rawPath === "/editor") {
    const reloaded = sessionStorage.getItem("editorReloaded");
    if (!reloaded) {
      sessionStorage.setItem("editorReloaded", "true");
      window.location.reload();
      return;
    }
  } else {
    sessionStorage.removeItem("editorReloaded");
  }

  for (const { pattern, render, layout, afterRender } of routes) {
    const match = rawPath.match(pattern);
    if (match) {
      const params = match.groups || {};
      const routeParams = { ...params, query: queryParams } as any;

      const content = await render(routeParams);
      app.innerHTML = layout(content);

      layouts.initNavbar();

      if (afterRender) afterRender(routeParams);

      return;
    }
  }

  app.innerHTML = layouts.mainLayout(`<h1>404 - Page Not Found</h1>`);
};


window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);
