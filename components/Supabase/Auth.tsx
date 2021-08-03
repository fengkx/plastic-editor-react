import React from "react";
import { supabase } from "../../db";

export const Auth: React.FC = () => {
  const session = supabase.auth.session();
  console.log(session);
  return <pre>1</pre>;
};
