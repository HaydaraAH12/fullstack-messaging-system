"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "@/components/app-toast";
import { useApiMutation } from "@/hooks/use-api";
import { Link, useRouter } from "@/i18n/navigation";
import { applyAuthResponse } from "@/lib/apply-auth-response";
import { register as registerAccount } from "@/lib/api/auth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { ApiError } from "@/types/api";
import type { RegisterRequest } from "@/types/auth";

function isServerError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status >= 500;
}

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const registerMutation = useApiMutation({
    mutationFn: (body: RegisterRequest) => registerAccount(body),
    onSuccess: (data) => {
      applyAuthResponse(data);
      router.push("/inbox");
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    const fullName = values.name.trim();
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      fullName,
    });
  });

  function getRegisterErrorMessage(error: unknown) {
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
          <label htmlFor="name" className="block text-sm font-medium">
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {registerMutation.isError && !isServerError(registerMutation.error) && (
          <p className="text-sm text-destructive">
            {getRegisterErrorMessage(registerMutation.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {registerMutation.isPending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
