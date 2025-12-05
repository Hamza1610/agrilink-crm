"use client";

import { Users, TrendingUp } from "lucide-react";

export default function RelationshipsPage() {
    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Relationships</h1>
                <p className="mt-1 text-gray-600">
                    Manage your farmer-buyer connections
                </p>
            </div>

            {/* Coming Soon Placeholder */}
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Users className="h-8 w-8 text-green-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
                <p className="mt-2 text-gray-600">
                    Relationship management features are under development
                </p>
                <div className="mt-6 flex justify-center gap-8">
                    <div className="text-center">
                        <TrendingUp className="mx-auto mb-2 h-6 w-6 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">
                            Transaction History
                        </p>
                    </div>
                    <div className="text-center">
                        <Users className="mx-auto mb-2 h-6 w-6 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">
                            Trust Scores
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
