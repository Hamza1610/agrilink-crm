import Link from "next/link";
import { Sprout, Users, TrendingUp, Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-700 shadow-xl">
          <Sprout className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="mb-4 bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-5xl font-bold text-transparent">
          ShukaLink CRM
        </h1>
        <p className="mb-8 text-xl text-gray-700">
          Connecting Farmers and Buyers Across Nigeria
        </p>

        {/* Features */}
        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <Package className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <h3 className="font-semibold text-gray-900">Manage Produce</h3>
            <p className="mt-1 text-sm text-gray-600">
              List and track your harvest
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <Users className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <h3 className="font-semibold text-gray-900">Build Relationships</h3>
            <p className="mt-1 text-sm text-gray-600">
              Connect with trusted partners
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <TrendingUp className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <h3 className="font-semibold text-gray-900">Grow Your Business</h3>
            <p className="mt-1 text-sm text-gray-600">
              Increase your income
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/auth/login"
          className="inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-green-800 hover:shadow-xl"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

