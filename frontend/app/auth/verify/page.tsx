"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi, type VerifyOTPRequest } from "@/lib/api";
import { Sprout, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyOTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneNumber = searchParams.get("phone") || "";
    const [otp, setOtp] = useState("");

    const verifyOTPMutation = useMutation({
        mutationFn: (data: VerifyOTPRequest) => authApi.verifyOTP(data),
        onSuccess: () => {
            // Navigate to dashboard after successful verification
            router.push("/dashboard");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyOTPMutation.mutate({
            phone_number: phoneNumber,
            otp_code: otp,
        });
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        setOtp(value);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
                        <Sprout className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Verify Your Number
                    </h1>
                    <p className="text-gray-600">
                        Enter the 6-digit code sent to
                        <br />
                        <span className="font-semibold text-gray-900">{phoneNumber}</span>
                    </p>
                </div>

                {/* OTP Form */}
                <div className="rounded-2xl bg-white p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="otp"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Verification Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onChange={handleOtpChange}
                                placeholder="000000"
                                required
                                maxLength={6}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-semibold tracking-widest text-gray-900 placeholder-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifyOTPMutation.isPending || otp.length !== 6}
                            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg disabled:opacity-50"
                        >
                            {verifyOTPMutation.isPending ? "Verifying..." : "Verify & Continue"}
                        </button>

                        {verifyOTPMutation.isError && (
                            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                Invalid verification code. Please try again.
                            </p>
                        )}

                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Didn&apos;t receive the code?{" "}
                    <Link
                        href={`/auth/login`}
                        className="font-medium text-green-600 hover:text-green-700"
                    >
                        Resend
                    </Link>
                </p>
            </div>
        </div>
    );
}
