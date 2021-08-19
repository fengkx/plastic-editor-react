import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import NotFound from "../../components/404";
import { hasSupabase, supabase } from "../../db";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLogin = Boolean(supabase.auth.session());
  if (isLogin) {
    router.push("/");
  }

  const handleSignIn = useCallback(
    async (ev) => {
      ev.preventDefault();
      const { error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      await router.push("/");
    },
    [email, password, router]
  );
  return (
    <div className="max-w-2xl mx-auto items-center flex text-center h-screen flex-col justify-center">
      <p className="text-3xl font-extrabold text-gray-900">
        Login to Sync your page to cloud stoarge
      </p>
      <form className="mt-8 space-y-6 w-8/12 mx-auto" onSubmit={handleSignIn}>
        <input type="hidden" name="remember" value="true" />
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        {/*<div className="flex items-center justify-between">*/}
        {/*    <div className="flex items-center">*/}
        {/*        <input id="remember-me" name="remember-me" type="checkbox"*/}
        {/*               className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />*/}
        {/*            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">*/}
        {/*                Remember me*/}
        {/*            </label>*/}
        {/*    </div>*/}

        {/*    <div className="text-sm">*/}
        {/*        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">*/}
        {/*            Forgot your password?*/}
        {/*        </a>*/}
        {/*    </div>*/}
        {/*</div>*/}
        <div className="flex items-center justify-between">
          <div className="text-sm hover:text-indigo-800">
            <Link href={"/signup"}>
              <a>Sign up</a>
            </Link>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default hasSupabase ? LoginPage : NotFound;
