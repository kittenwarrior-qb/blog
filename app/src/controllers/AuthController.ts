import { AppContext } from "../models/ContextModel";
import { authWithGoogle } from "../libs/firebase";
import toast from "../libs/toast";
import { AuthView } from "../views/AuthView";
import { AuthService } from "../services/AuthService";
import { AuthModel } from "../models/AuthModel";

export class AuthController {
  private view: AuthView;
  private authService: AuthService;

  constructor() {
    this.view = new AuthView();
    this.authService = new AuthService();
  }

  private updateUserContext(authModel: AuthModel) {
    AppContext.setAccessToken(authModel.accessToken);
    AppContext.setProfileImg(authModel.profile_img);
    AppContext.setUsername(authModel.username);
  }

  private validateForm(type: 'login' | 'register', data: Record<string, string>): string | null {
    const { fullname, email, password } = data;

    if (!email) return "Enter your email";
    if (!password) return "Enter your password";

    if (type === 'register' && (!fullname || fullname.length < 3)) {
      return "Fullname must be at least 3 characters";
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (!emailRegex.test(email)) return "Email is not valid";
    if (!passwordRegex.test(password)) {
      return "Password must be 6-20 chars, include uppercase, lowercase, number";
    }

    return null;
  }

  private async handleAuth(type: 'login' | 'register', formData: Record<string, string>) {
    try {
      const response = type === 'login'
        ? await this.authService.login(formData)
        : await this.authService.register(formData);

      const authModel = new AuthModel(response);
      this.updateUserContext(authModel);
      toast.success(`${type === 'login' ? 'Login' : 'Registration'} successful!`);
      window.location.hash = "#/";
    } catch (err: any) {
      toast.error(err.response?.data?.message || `${type === 'login' ? 'Login' : 'Registration'} failed`);
    }
  }

  private async handleForgotPassword(email: string) {
    if (!email) {
      toast.error("Enter your email");
      return;
    }

    try {
      toast.loading("Sending reset password email...");  
      await this.authService.forgotPassword({ email });

      toast.dismissLoading();  
      toast.success("Reset password link sent. Check your email.");
    } catch (err: any) {
      toast.dismissLoading(); 
      toast.error(err.response?.data?.message || "Failed to send reset email");
    }
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

  public initForgotPasswordFormEvents() {
    const form = document.getElementById('forgotForm') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = (form.querySelector('#email') as HTMLInputElement).value.trim();
      if (!email) return toast.error("Enter your email");

      await this.handleForgotPassword(email);
    });
  }

  public initResetPasswordFormEvents(token: string) {
    const form = document.getElementById('resetForm') as HTMLFormElement | null;
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const newPassword = (form.querySelector('#new-password') as HTMLInputElement).value.trim();
      const confirmPassword = (form.querySelector('#confirm-password') as HTMLInputElement).value.trim();

      if (!newPassword || !confirmPassword) {
        return toast.error("Please fill in all password fields");
      }
      if (newPassword !== confirmPassword) {
        return toast.error("Passwords do not match");
      }

      try {
        await this.authService.resetPassword({ token, newPassword });
        toast.success("Password has been reset successfully!");
        window.location.hash = '#/login';
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to reset password");
      }
    });

  }


  public initAuthFormEvents(type: 'login' | 'register') {
    const form = document.getElementById('authForm') as HTMLFormElement | null;
    const googleBtn = document.querySelector('#googleAuth') as HTMLButtonElement | null;
    const forgotLink = document.querySelector('#forgotPasswordLink') as HTMLElement | null;

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data: Record<string, string> = {};
      for (const [key, value] of new FormData(form).entries()) {
        data[key] = typeof value === 'string' ? value : '';
      }

      const error = this.validateForm(type, data);
      if (error) return toast.error(error);

      const submitBtn = form.querySelector("button[type='submit']");
      submitBtn?.setAttribute("disabled", "true");

      await this.handleAuth(type, data);

      submitBtn?.removeAttribute("disabled");
    });

    if (googleBtn) {
      googleBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          const result = await authWithGoogle();
          if (!result?.user) throw new Error("Google login failed");

          const idToken = await result.user.getIdToken();
          const response = await this.authService.loginWithGoogle(idToken);
          const authModel = new AuthModel(response);

          this.updateUserContext(authModel);
          toast.success("Google login successful!");
          window.location.hash = "#/";
        } catch (err: any) {
          console.error("[Google Login Error]:", err);
          toast.error("Google authentication failed");
        }
      });
    }

    if (forgotLink && type === 'login') {
      forgotLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const emailInput = document.querySelector("#email") as HTMLInputElement;
        if (!emailInput) return toast.error("Email input not found");

        await this.handleForgotPassword(emailInput.value.trim());
      });
    }

    this.initTogglePassword();
  }

  public LoginPage(): string {
    return this.view.renderLogin();
  }

  public RegisterPage(): string {
    return this.view.renderRegister();
  }

  public ForgotPasswordPage(): string {
    return this.view.renderForgotPassword(); 
  }

  public ResetPasswordPage(token: string): string {
    return this.view.renderResetPassword(token);
  }

}
