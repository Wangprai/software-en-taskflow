"use client";

import { useAuth } from "@/providers/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, LoginInput, RegisterInput } from "./api";
import { toast } from "sonner";
import { TOKEN_STORAGE_KEY } from "@/constants";

export function useLogin() {
  const { setSession } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const auth = await authApi.login(input);

      localStorage.setItem(TOKEN_STORAGE_KEY, auth.accessToken);

      const user = await authApi.me();

      return {
        ...auth,
        user,
      };
    },

    onSuccess: (auth) => {
      setSession(auth.accessToken, auth.user);

      toast.success(`Welcome back, ${auth.user.name.split(" ")[0]}`);

      router.replace("/workspaces");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  const { setSession } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const auth = await authApi.register(input);
      const user = await authApi.me();

      return {
        auth,
        user,
      };
    },

    onSuccess: ({ auth, user }) => {
      setSession(auth.accessToken, user);

      toast.success("Account created");

      router.replace("/workspaces");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export { useAuth } from "@/providers/auth-provider";
