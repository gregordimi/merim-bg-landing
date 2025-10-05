import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { content } from "@/i18n/bg";

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

interface RegisterDialogueProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

interface FormErrors {
  email?: string;
  terms?: string;
  captcha?: string;
}

interface FormData {
  email: string;
  agreedToTerms: boolean;
  agreedToMarketing: boolean;
}

export function RegisterDialogue({
  children,
  onSuccess,
}: RegisterDialogueProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    agreedToTerms: false,
    agreedToMarketing: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    "6Lef18QrAAAAAMjpi0ys7lyDRa83lkzBCfjTTIv2";
  const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL ||
    "https://qprzrpyfhsvfdzlbnnjd.supabase.co";
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Имейлът е задължителен";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = content.preRegister.invalidEmail;
    }

    if (!formData.agreedToTerms) {
      newErrors.terms = content.preRegister.termsError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing/interacting
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const executeCaptcha = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error("reCAPTCHA not loaded"));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: "register" })
          .then((token) => {
            resolve(token);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Execute reCAPTCHA
      const token = await executeCaptcha();
      setCaptchaToken(token);

      // Call the Supabase function
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authorization header if anon key is available
      if (SUPABASE_ANON_KEY) {
        headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: formData.email.trim(),
          captchaToken: token,
          options: {
            agreedToTerms: formData.agreedToTerms,
            agreedToMarketing: formData.agreedToMarketing,
            locale: "bg",
            datetime: new Date().toISOString(),
            source: window.location.href,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setIsSuccess(true);
      onSuccess?.();

      // Close dialog after success message
      // setTimeout(() => {
      //   setIsOpen(false);
      //   setIsSuccess(false);
      // }, 2500);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";

      if (errorMessage.includes("CAPTCHA")) {
        setErrors({
          captcha: "CAPTCHA verification failed. Please try again.",
        });
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        email: "",
        agreedToTerms: false,
        agreedToMarketing: false,
      });
      setErrors({});
      setIsSuccess(false);
      setCaptchaToken("");
    }
  };

  const isFormValid =
    formData.email.trim() && formData.agreedToTerms && !isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{content.preRegister.title}</DialogTitle>
          <DialogDescription>
            {content.preRegister.description}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="text-green-600 font-medium text-lg">
              ✓ {content.preRegister.successMessage}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{content.preRegister.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={content.preRegister.emailPlaceholder}
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                disabled={isSubmitting}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-primary"
                }
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <div id="email-error" className="text-red-600 text-sm">
                  {errors.email}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) =>
                    updateFormData("agreedToTerms", checked === true)
                  }
                  disabled={isSubmitting}
                  className={`mt-0.5 ${
                    errors.terms ? "border-red-500" : "border-primary"
                  }`}
                  aria-invalid={!!errors.terms}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-normal leading-5 cursor-pointer flex-1"
                >
                  Съгласявам се с{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    общите условия
                  </a>{" "}
                  и{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    политиката за поверителност
                  </a>
                </label>
              </div>
              {errors.terms && (
                <div id="terms-error" className="text-red-600 text-sm ml-7">
                  {errors.terms}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                {/* <Checkbox
                  id="marketing"
                  checked={formData.agreedToMarketing}
                  onCheckedChange={(checked) =>
                    updateFormData("agreedToMarketing", checked === true)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5 border-primary"
                /> */}
                <label
                  htmlFor="marketing"
                  className="text-sm font-normal leading-5 cursor-pointer flex-1"
                >
                  {content.preRegister.marketingLabel}
                </label>
              </div>
            </div>

            {errors.captcha && (
              <div className="text-red-600 text-sm text-center">
                {errors.captcha}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!isFormValid}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Регистриране...
                </span>
              ) : (
                content.preRegister.submitButton
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
