import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="text-xl font-semibold text-gray-900">
            SANAÉRA Admin
          </Link>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/admin" className="hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/admin/products" className="hover:text-gray-900">
              Products
            </Link>
            <Link href="/admin/orders" className="hover:text-gray-900">
              Orders
            </Link>
            <Link href="/" className="hover:text-gray-900">
              Back to store
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}