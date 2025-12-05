"use client";

import { useQuery } from "@tanstack/react-query";
import { produceApi, type Produce } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Package, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

function ProduceCard({ produce }: { produce: Produce }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold capitalize text-gray-900">
                        {produce.crop_type}
                    </h3>
                    <p className="text-sm text-gray-600">
                        By {produce.farmer_name || "Unknown Farmer"}
                    </p>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${produce.status === "available"
                            ? "bg-green-100 text-green-700"
                            : produce.status === "reserved"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {produce.status}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium text-gray-900">{produce.quantity_kg} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per kg</span>
                    <span className="font-semibold text-green-600">
                        {formatCurrency(produce.price_per_kg || produce.expected_price_per_kg || 0)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Harvest Date</span>
                    <span className="font-medium text-gray-900">
                        {new Date(produce.harvest_date).toLocaleDateString()}
                    </span>
                </div>
                {produce.distance_km && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distance</span>
                        <span className="font-medium text-gray-900">
                            {produce.distance_km.toFixed(1)} km away
                        </span>
                    </div>
                )}
            </div>

            {produce.quality_indicators && produce.quality_indicators.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {produce.quality_indicators.map((indicator, idx) => (
                        <span
                            key={idx}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                        >
                            {indicator}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    Listed {formatRelativeTime(produce.created_at)}
                </p>
            </div>
        </div>
    );
}

export default function ProducePage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data, isLoading, error } = useQuery({
        queryKey: ["produce", searchQuery, statusFilter],
        queryFn: () =>
            produceApi.list({
                crop_type: searchQuery || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
            }),
    });

    const isFarmer = user?.user_type === "farmer";

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Produce</h1>
                    <p className="mt-1 text-gray-600">
                        {isFarmer
                            ? "Manage your produce listings"
                            : "Browse available produce"}
                    </p>
                </div>
                {isFarmer && (
                    <Link
                        href="/dashboard/produce/new"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5" />
                        Add Produce
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by crop type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                </select>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
            ) : error ? (
                <div className="rounded-lg bg-red-50 p-6 text-center">
                    <p className="text-red-600">Failed to load produce. Please try again.</p>
                </div>
            ) : data?.data.items && data.data.items.length > 0 ? (
                <>
                    <p className="mb-4 text-sm text-gray-600">
                        Showing {data.data.items.length} of {data.data.total} produce listings
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data.data.items.map((produce) => (
                            <ProduceCard key={produce.id} produce={produce} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">No produce found</p>
                    <p className="mt-1 text-sm text-gray-500">
                        {isFarmer
                            ? "Click 'Add Produce' to create your first listing"
                            : "Check back later for new listings"}
                    </p>
                </div>
            )}
        </div>
    );
}
