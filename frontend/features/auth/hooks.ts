"use client";

import { useAuth } from "@/providers/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, LoginInput, RegisterInput } from "./api";
import { toast } from "sonner";

export function useLogin() {
  const { setSession } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      authApi.login(input),

    onSuccess: (auth) => {
      setSession(auth);

      toast.success(
        `Welcome back, ${auth.user.name.split(" ")[0]}`
      );

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
    mutationFn: (input: RegisterInput) =>
      authApi.register(input),

    onSuccess: (auth) => {
      setSession(auth);

      toast.success("Account created");

      router.replace("/workspaces");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export { useAuth}  from "@/providers/auth-provider";