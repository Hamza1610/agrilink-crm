"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionApi, type Transaction } from "@/lib/api";
import { Receipt, Package, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function getStatusColor(status: Transaction["status"]) {
    const colors = {
        matched: "bg-blue-100 text-blue-700",
        payment_pending: "bg-yellow-100 text-yellow-700",
        paid: "bg-green-100 text-green-700",
        in_transit: "bg-purple-100 text-purple-700",
        completed: "bg-emerald-100 text-emerald-700",
        cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Receipt className="h-6 w-6 text-green-700" />
                </div>
                <div>
                    <p className="font-semibold text-gray-900">
                        Transaction #{transaction.id.slice(0, 12)}
                    </p>
                    <p className="text-sm text-gray-600">
                        {formatDateTime(transaction.created_at)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(transaction.total_amount)}
                    </p>
                    <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            transaction.status
                        )}`}
                    >
                        {transaction.status.replace("_", " ")}
                    </span>
                </div>
                <button className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                    <ArrowUpRight className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
}

export default function TransactionsPage() {
    // Transaction endpoint not implemented in backend yet
    // const { data, isLoading, error } = useQuery({
    //     queryKey: ["transactions"],
    //     queryFn: () => transactionApi.list(),
    // });

    const data: { data: { items: Transaction[]; total: number } } | undefined = {
        data: { items: [], total: 0 }
    };
    const isLoading = false;
    const error = null;

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <p className="mt-1 text-gray-600">
                    View and manage all your transactions
                </p>
            </div>

            {/* Stats */}
            {data?.data && (
                <div className="mb-6 grid gap-6 sm:grid-cols-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Total Transactions</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {data.data.total}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">
                            {data.data.items.filter((t) => t.status === "completed").length}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="mt-1 text-2xl font-bold text-yellow-600">
                            {data.data.items.filter((t) => t.status === "payment_pending" || t.status === "matched").length}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatCurrency(
                                data.data.items.reduce((sum, t) => sum + t.total_amount, 0)
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                </div>
            ) : error ? (
                <div className="rounded-lg bg-red-50 p-6 text-center">
                    <p className="text-red-600">
                        Failed to load transactions. Please try again.
                    </p>
                </div>
            ) : data?.data.items && data.data.items.length > 0 ? (
                <div className="space-y-3">
                    {data.data.items.map((transaction) => (
                        <TransactionRow key={transaction.id} transaction={transaction} />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white py-12 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">No transactions yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Your transactions will appear here once you start trading
                    </p>
                </div>
            )}
        </div>
    );
}
