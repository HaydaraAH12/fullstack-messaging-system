"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "@/components/app-toast";
import { useApiMutation } from "@/hooks/use-api";
import { Link, useRouter } from "@/i18n/navigation";
import { resolvePostLoginPath } from "@/lib/auth-routes";
import { applyAuthResponse } from "@/lib/apply-auth-response";
import { login } from "@/lib/api/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { ApiError } from "@/types/api";
import type { LoginRequest } from "@/types/auth";

function isServerError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status >= 500;
}

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const loginMutation = useApiMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: (data) => {
      applyAuthResponse(data);
      router.push(resolvePostLoginPath(searchParams.get("callbackUrl")));
    },
    onError: (error) => {
      if (isServerError(error)) {
        toast.error(tAuth("serverError"));
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  function getLoginErrorMessage(error: unknown) {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return t("failed");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {loginMutation.isError && !isServerError(loginMutation.error) && (
          <p className="text-sm text-destructive">
            {getLoginErrorMessage(loginMutation.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loginMutation.isPending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-foreground">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
