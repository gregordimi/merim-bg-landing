import React, { useState } from "react";
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

interface RegisterDialogueProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

interface FormErrors {
  email?: string;
  terms?: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare registration data for API call
      const registrationData = {
        email: formData.email.trim(),
        agreedToTerms: formData.agreedToTerms,
        agreedToMarketing: formData.agreedToMarketing,
        registrationDate: new Date().toISOString(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      console.log("Registration data to be sent:", registrationData);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/pre-register', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(registrationData)
      // })
      // if (!response.ok) throw new Error('Registration failed')

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
      onSuccess?.();

      // Close dialog after success message
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2500);
    } catch (err) {
      setErrors({ email: content.preRegister.errorMessage });
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
            {/* <div className="space-y-2">
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
            </div> */}

            {/* <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing"
                  checked={formData.agreedToMarketing}
                  onCheckedChange={(checked) =>
                    updateFormData("agreedToMarketing", checked === true)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5 border-primary"
                />
                <label
                  htmlFor="marketing"
                  className="text-sm font-normal leading-5 cursor-pointer flex-1"
                >
                  {content.preRegister.marketingLabel}
                </label>
              </div>
            </div> */}
                <Label
                  htmlFor="marketing"
                  className="text-sm font-normal leading-5 cursor-pointer flex-1"
                >
                  {content.preRegister.marketingLabel}
                </Label>

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
