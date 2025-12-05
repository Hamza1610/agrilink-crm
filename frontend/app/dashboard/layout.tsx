"use client";

import ProtectedRoute from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-y-auto lg:pl-64">
                    <div className="pt-16 lg:pt-0">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
