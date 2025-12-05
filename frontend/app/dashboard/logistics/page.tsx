"use client";

import { Truck, MapPin } from "lucide-react";

export default function LogisticsPage() {
    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Logistics</h1>
                <p className="mt-1 text-gray-600">
                    Track and manage delivery logistics
                </p>
            </div>

            {/* Coming Soon Placeholder */}
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Truck className="h-8 w-8 text-green-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
                <p className="mt-2 text-gray-600">
                    Logistics tracking features are under development
                </p>
                <div className="mt-6 flex justify-center gap-8">
                    <div className="text-center">
                        <Truck className="mx-auto mb-2 h-6 w-6 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">
                            Delivery Tracking
                        </p>
                    </div>
                    <div className="text-center">
                        <MapPin className="mx-auto mb-2 h-6 w-6 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">
                            Location Services
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
