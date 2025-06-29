import { createClient } from "@/lib/supabase-server";
import Image from "next/image";
import { redirect } from "next/navigation";
import Logo from "@/public/XMA-White.svg";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative" data-admin-page>
      {/* Enhanced navigation with glass effect */}
      <nav className="sticky top-0 z-50 p-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl backdrop-blur-lg ">
          <div className="px-6 py-4">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src={Logo}
                  alt="XMA Progress Logo"
                  className="h-8 w-auto"
                  width={32}
                  height={32}
                />
              </div>
              <form action="/api/auth/signout" method="post">
                <button className="btn-glass px-6 py-2 rounded-lg text-sm font-medium">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with enhanced spacing and backdrop */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

