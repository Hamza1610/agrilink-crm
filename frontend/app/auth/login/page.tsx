"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginRequest } from "@/lib/api";
import { Sprout } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [userType, setUserType] = useState<"farmer" | "buyer">("farmer");
    const [language, setLanguage] = useState<"english" | "hausa">("english");

    const requestOTPMutation = useMutation({
        mutationFn: (data: LoginRequest) => authApi.requestOTP(data),
        onSuccess: () => {
            // Navigate to OTP verification page with phone number
            router.push(`/auth/verify?phone=${encodeURIComponent(phoneNumber)}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        requestOTPMutation.mutate({
            phone_number: phoneNumber,
            user_type: userType,
            language_preference: language,
        });
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
                        Welcome to ShukaLink
                    </h1>
                    <p className="text-gray-600">
                        Connecting farmers and buyers across Nigeria
                    </p>
                </div>

                {/* Login Form */}
                <div className="rounded-2xl bg-white p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+2348012345678"
                                required
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Enter your WhatsApp number with country code
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Account Type
                            </label>
                            <div className="mt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setUserType("farmer")}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 font-medium transition-all ${userType === "farmer"
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    Farmer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserType("buyer")}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 font-medium transition-all ${userType === "buyer"
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    Buyer
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Preferred Language
                            </label>
                            <div className="mt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLanguage("english")}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 font-medium transition-all ${language === "english"
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLanguage("hausa")}
                                    className={`flex-1 rounded-lg border-2 px-4 py-3 font-medium transition-all ${language === "hausa"
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    Hausa
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={requestOTPMutation.isPending}
                            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg disabled:opacity-50"
                        >
                            {requestOTPMutation.isPending ? "Sending OTP..." : "Continue"}
                        </button>

                        {requestOTPMutation.isError && (
                            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                Failed to send OTP. Please check your phone number and try
                                again.
                            </p>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    We'll send you a verification code via WhatsApp
                </p>
            </div>
        </div>
    );
}

