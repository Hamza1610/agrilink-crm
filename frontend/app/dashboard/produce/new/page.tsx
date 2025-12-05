"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { produceApi, type CreateProduceRequest } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProducePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<CreateProduceRequest>({
        crop_type: "",
        quantity_kg: 0,
        harvest_date: "",
        expected_price_per_kg: 0,
        location: "",
        quality_indicators: [],
    });

    const createProduceMutation = useMutation({
        mutationFn: (data: CreateProduceRequest) => produceApi.create(data),
        onSuccess: () => {
            router.push("/dashboard/produce");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format harvest_date as ISO datetime and calculate expires_at (7 days from harvest)
        const harvestDateTime = new Date(formData.harvest_date + "T00:00:00").toISOString();
        const expiresAt = new Date(formData.harvest_date);
        expiresAt.setDate(expiresAt.getDate() + 7);

        createProduceMutation.mutate({
            ...formData,
            harvest_date: harvestDateTime,
            expires_at: expiresAt.toISOString(),
        });
    };

    const handleQualityIndicatorAdd = (indicator: string) => {
        if (indicator && !formData.quality_indicators?.includes(indicator)) {
            setFormData({
                ...formData,
                quality_indicators: [...(formData.quality_indicators || []), indicator],
            });
        }
    };

    const handleQualityIndicatorRemove = (indicator: string) => {
        setFormData({
            ...formData,
            quality_indicators: formData.quality_indicators?.filter(
                (i) => i !== indicator
            ),
        });
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/produce"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Produce
                </Link>
                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                    Add New Produce
                </h1>
                <p className="mt-1 text-gray-600">
                    List your produce for buyers to discover
                </p>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
                    {/* Crop Type */}
                    <div>
                        <label
                            htmlFor="crop_type"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Crop Type *
                        </label>
                        <input
                            id="crop_type"
                            type="text"
                            required
                            value={formData.crop_type}
                            onChange={(e) =>
                                setFormData({ ...formData, crop_type: e.target.value })
                            }
                            placeholder="e.g., Tomatoes, Yams, Onions"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <label
                            htmlFor="quantity_kg"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Quantity (kg) *
                        </label>
                        <input
                            id="quantity_kg"
                            type="number"
                            required
                            min="1"
                            value={formData.quantity_kg || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    quantity_kg: parseFloat(e.target.value),
                                })
                            }
                            placeholder="50"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Harvest Date */}
                    <div>
                        <label
                            htmlFor="harvest_date"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Harvest Date *
                        </label>
                        <input
                            id="harvest_date"
                            type="date"
                            required
                            value={formData.harvest_date}
                            onChange={(e) =>
                                setFormData({ ...formData, harvest_date: e.target.value })
                            }
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Location *
                        </label>
                        <input
                            id="location"
                            type="text"
                            required
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="e.g., Kano, Nigeria"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Expected Price */}
                    <div>
                        <label
                            htmlFor="expected_price_per_kg"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Expected Price per kg (₦)
                        </label>
                        <input
                            id="expected_price_per_kg"
                            type="number"
                            min="0"
                            value={formData.expected_price_per_kg || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    expected_price_per_kg: parseFloat(e.target.value),
                                })
                            }
                            placeholder="1500"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Quality Indicators */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Quality Indicators
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {["firm", "no_blemishes", "organic", "fresh", "clean"].map(
                                (indicator) => (
                                    <button
                                        key={indicator}
                                        type="button"
                                        onClick={() =>
                                            formData.quality_indicators?.includes(indicator)
                                                ? handleQualityIndicatorRemove(indicator)
                                                : handleQualityIndicatorAdd(indicator)
                                        }
                                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${formData.quality_indicators?.includes(indicator)
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {indicator.replace("_", " ")}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <Link
                            href="/dashboard/produce"
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={createProduceMutation.isPending}
                            className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg disabled:opacity-50"
                        >
                            {createProduceMutation.isPending ? "Creating..." : "Create Listing"}
                        </button>
                    </div>

                    {createProduceMutation.isError && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            Failed to create produce listing. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
