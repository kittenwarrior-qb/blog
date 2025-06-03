import { InputBox } from '../components/inputbox';
import { AnimationWrapper } from '../libs/gsapAnimation';
import { AppContext } from '../models/ContextModel';

export class AuthView {
  private redirectIfLoggedIn(): boolean  {
    if (AppContext.user.accessToken) {
      window.location.hash = '#/';
      return true;
    }
    return false;
  }

  public renderLogin(): string {
    const redirected = this.redirectIfLoggedIn();
    if (redirected) return ''; 

    const form = `
      <section class="h-cover flex items-center justify-center">
        <form id="authForm" class="w-[80%] max-w-[400px]">
          <h1 class="text-4xl font-gelasio capitalize text-center mb-24">Welcome back</h1>

          <div class="mt-10">
            ${InputBox({ name: 'email', type: 'email', id: 'email', placeholder: 'email', icon: "fa-solid fa-at"})}
            ${InputBox({ name: 'password', type: 'password', id: 'password', placeholder: 'Password', icon: "fa-solid fa-key"})}
          </div>

          <button type="submit" class="btn-dark center mt-10">login</button>

          <div class="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr class="w-1/2 border-black" />
            <p>or</p>
            <hr class="w-1/2 border-black" />
          </div>

          <button type="button" class="btn-dark flex items-center gap-2 justify-center !mx-auto w-[90%]" id="googleAuth">
            <img src="https://img.icons8.com/color/512/google-logo.png" class="w-5"/>
            continue with google
          </button>

          <p class="!mt-6 text-dark-gray-500 text-xl text-center">
            Forgot password? 
            <a href="#/forgot-password" class="underline text-black ml-1">Reset here</a>
          </p>
          <p class="!mt-6 text-dark-gray-500 text-xl text-center">
            Don't have an account? 
            <a href="#/register" class="underline text-black ml-1">Join us today</a>
          </p>
        </form>
      </section>
    `;

    return AnimationWrapper({ children: form, fromY: 30, toY: 0, duration: 0.5 });
  }

  public renderRegister(): string {
    const redirected = this.redirectIfLoggedIn();
    if (redirected) return ''; 

    const form = `
      <section class="h-cover flex items-center justify-center">
        <form id="authForm" class="w-[80%] max-w-[400px]">
          <h1 class="text-4xl font-gelasio capitalize text-center mb-24">Join us today</h1>

          <div class="mt-10">
            ${InputBox({ name: 'fullname', type: 'text', id: 'name', placeholder: 'full name', icon: 'fa-regular fa-user'})}
            ${InputBox({ name: 'email', type: 'email', id: 'email', placeholder: 'email', icon: "fa-solid fa-at"})}
            ${InputBox({ name: 'password', type: 'password', id: 'password', placeholder: 'Password', icon: "fa-solid fa-key"})}
          </div>

          <button type="submit" class="btn-dark center mt-10">register</button>

          <div class="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr class="w-1/2 border-black" />
            <p>or</p>
            <hr class="w-1/2 border-black" />
          </div>

          <button type="button" class="btn-dark flex items-center gap-2 justify-center mx-auto w-[90%]" id="googleAuth">
            <img src="https://img.icons8.com/color/512/google-logo.png" class="w-5"/>
            continue with google
          </button>

          <p class="!mt-6 text-dark-gray-500 text-xl text-center">
            Already a member? 
            <a href="#/login" class="underline text-black ml-1">Sign in here</a>
          </p>
        </form>
      </section>
    `;

    return AnimationWrapper({ children: form, fromY: 30, toY: 0, duration: 0.5 });
  }

  public renderForgotPassword(): string {
    const form = `
      <section class="h-cover flex items-center justify-center">
        <form id="forgotForm" class="w-[80%] max-w-[400px]">
          <h1 class="text-4xl font-gelasio capitalize text-center !mb-24">Forgot Password</h1>
          <div class="!mt-10">
            ${InputBox({ name: 'email', type: 'email', id: 'email', placeholder: 'Enter your email', icon: "fa-solid fa-at"})}
          </div>
          <button type="submit" class="btn-dark center !mt-10">Send reset link</button>
          <p class="!mt-6 text-dark-gray-500 text-xl text-center">
            Back to login? 
            <a href="#/login" class="underline text-black !ml-1">Sign in</a>
          </p>
        </form>
      </section>
    `;
    return AnimationWrapper({ children: form, fromY: 30, toY: 0, duration: 0.5 });
  }

  public renderResetPassword(token: string): string {
    const form = `
      <section class="h-cover flex items-center justify-center">
        <form id="resetForm" class="w-[80%] max-w-[400px]">
          <h1 class="text-4xl font-gelasio capitalize text-center mb-24">Reset Password</h1>
          <input type="hidden" name="token" value="${token}" />
          <div class="mt-10">
            ${InputBox({ name: 'newPassword', type: 'password', id: 'new-password', placeholder: 'New Password', icon: "fa-solid fa-key" })}
            ${InputBox({ name: 'confirmPassword', type: 'password', id: 'confirm-password', placeholder: 'Confirm Password', icon: "fa-solid fa-key" })}
          </div>
          <button type="submit" class="btn-dark center mt-10">Reset Password</button>
          <p class="!mt-6 text-dark-gray-500 text-xl text-center">
            Back to login? 
            <a href="#/login" class="underline text-black ml-1">Sign in</a>
          </p>
        </form>
      </section>
    `;
    return AnimationWrapper({ children: form, fromY: 30, toY: 0, duration: 0.5 });
  }

}
