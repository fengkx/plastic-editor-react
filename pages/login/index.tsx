import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import NotFound from "../../components/404";
import { hasSupabase, supabase } from "../../db";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../hooks/signin-signout";
import { GitHubLoginButton } from "../../components/social-buttons/GitHubLoginButton";
import { GoogleLoginButton } from "../../components/social-buttons/GoogleLoginButton";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { email, setEmail, password, setPassword, error, signIn } = useAuth({
    supabase,
  });
  const isLogin = Boolean(supabase.auth.session());
  if (isLogin) {
    router.push("/");
  }

  const handleSignIn = useCallback(
    async (ev) => {
      ev.preventDefault();
      await signIn({ email, password, redirectTo: window.location.href });
    },
    [email, password, signIn]
  );
  return (
    <div className="max-w-3xl mx-auto items-center flex text-center h-screen flex-col justify-center">
      <Toaster />
      <p className="text-2xl font-extrabold text-gray-900">
        Login to Sync your page to cloud stoarge
      </p>
      <div className="w-64 mt-8 space-y-6">
        <GitHubLoginButton
          onClick={useCallback(async () => {
            await signIn({ provider: "github" });
          }, [signIn])}
        />
        <GoogleLoginButton
          onClick={useCallback(async () => {
            await signIn({ provider: "google" });
          }, [signIn])}
        />
      </div>
      {/*<form className="mt-8 space-y-6 w-10/12 mx-auto" onSubmit={handleSignIn}>*/}
      {/*  <input type="hidden" name="remember" value="true" />*/}
      {/*  <div className="rounded-md shadow-sm -space-y-px">*/}
      {/*    <div>*/}
      {/*      <label htmlFor="email-address" className="sr-only">*/}
      {/*        Email address*/}
      {/*      </label>*/}
      {/*      <input*/}
      {/*        id="email-address"*/}
      {/*        name="email"*/}
      {/*        type="email"*/}
      {/*        autoComplete="email"*/}
      {/*        required*/}
      {/*        value={email}*/}
      {/*        onChange={(ev) => setEmail(ev.target.value)}*/}
      {/*        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"*/}
      {/*        placeholder="Email address"*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*      <label htmlFor="password" className="sr-only">*/}
      {/*        Password*/}
      {/*      </label>*/}
      {/*      <input*/}
      {/*        id="password"*/}
      {/*        name="password"*/}
      {/*        type="password"*/}
      {/*        autoComplete="current-password"*/}
      {/*        required*/}
      {/*        value={password}*/}
      {/*        onChange={(ev) => setPassword(ev.target.value)}*/}
      {/*        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"*/}
      {/*        placeholder="Password"*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <p className="text-red-500">{error}</p>*/}
      {/*  <div className="flex items-center justify-between">*/}
      {/*    <div className="text-sm hover:text-indigo-800">*/}
      {/*      <Link href={"/signup"}>*/}
      {/*        <a>Sign up</a>*/}
      {/*      </Link>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <button*/}
      {/*      type="submit"*/}
      {/*      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"*/}
      {/*    >*/}
      {/*      Sign in*/}
      {/*    </button>*/}
      {/*    <div className="w-60">*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</form>*/}
    </div>
  );
};

export default hasSupabase ? LoginPage : NotFound;
