import { SupabaseClient, UserCredentials } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useToggle } from "@react-hookz/web";
export type IUseAuth = {
  supabase: SupabaseClient;
};

export type ISignIn = {
  email?: UserCredentials["email"];
  password?: UserCredentials["password"];
  redirectTo?: string;
  provider?: UserCredentials["provider"];
};
export function useAuth({ supabase }: IUseAuth) {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, toggleLoading] = useToggle(false);
  const signIn = useCallback(
    async ({ email, password, redirectTo, provider }: ISignIn = {}) => {
      toggleLoading(true);
      const resp = await supabase.auth.signIn(
        { email, password, provider },
        { redirectTo }
      );
      const { error } = resp;
      if (error) {
        setError(error.message);
      }
      toggleLoading(false);
      return resp;
    },
    []
  );
  const signUp = useCallback(
    async ({ email, password, redirectTo, provider }: ISignIn = {}) => {
      toggleLoading(true);
      const resp = await supabase.auth.signUp(
        { email, password, provider },
        { redirectTo }
      );
      const { error, user, session } = resp;
      if (error) {
        setError(error.message);
      }
      toggleLoading(false);
      if (user && !session) {
        toast("Check your email for the confirmation link.", {
          duration: 4000,
          position: "bottom-center",
        });
      }
      return resp;
    },
    []
  );

  // useEffect(() => {
  //     if(error) {
  //         toast.error(error, {position: 'bottom-center'})
  //     }
  // }, [error])

  return { email, setEmail, password, setPassword, error, signIn, signUp };
}
