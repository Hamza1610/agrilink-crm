"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { produceApi, transactionApi } from "@/lib/api";
import { Package, Receipt, Users, TrendingUp } from "lucide-react";

function StatCard({
    icon: Icon,
    label,
    value,
    trend,
}: {
    icon: any;
    label: string;
    value: string | number;
    trend?: string;
}) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Icon className="h-6 w-6 text-green-700" />
                </div>
                {trend && (
                    <span className="text-sm font-medium text-green-600">{trend}</span>
                )}
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: produceData } = useQuery({
        queryKey: ["produce", "stats"],
        queryFn: () => produceApi.list(),
        retry: false,
    });

    // Transaction endpoint not implemented in backend yet
    // const { data: transactionData } = useQuery({
    //     queryKey: ["transactions", "stats"],
    //     queryFn: () => transactionApi.list({ limit: 10 }),
    // });
    const transactionData: { data: { items: any[]; total: number } } | undefined = {
        data: { items: [], total: 0 }
    };

    const isFarmer = user?.user_type === "farmer";
    const isBuyer = user?.user_type === "buyer";

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.phone_number}
                </h1>
                <p className="mt-1 text-gray-600">
                    Here&apos;s what&apos;s happening with your{" "}
                    {isFarmer ? "produce" : "purchases"} today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Package}
                    label="Available Produce"
                    value={produceData?.data.total || 0}
                />
                <StatCard
                    icon={Receipt}
                    label="Total Transactions"
                    value={transactionData?.data.total || 0}
                />
                <StatCard
                    icon={Users}
                    label="Active Relationships"
                    value="12"
                    trend="+2"
                />
                <StatCard
                    icon={TrendingUp}
                    label="This Month"
                    value="₦245K"
                    trend="+12%"
                />
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Recent Activity
                </h2>

                {transactionData?.data.items && transactionData.data.items.length > 0 ? (
                    <div className="space-y-3">
                        {transactionData.data.items.slice(0, 5).map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                        <Receipt className="h-5 w-5 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Transaction #{transaction.id.slice(0, 8)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Status: {transaction.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        ₦{transaction.total_amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(transaction.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
                        <Receipt className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                        <p className="text-gray-600">No recent transactions</p>
                        <p className="mt-1 text-sm text-gray-500">
                            {isFarmer
                                ? "Start by adding your produce to the marketplace"
                                : "Browse available produce to get started"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
