import { createClient } from "@/lib/supabase-server";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/public/XMA-White.svg";
import { UserDropdown } from "@/components/UserDropdown";

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

  // Get team member info
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('*')
    .eq('email', user.email)
    .single();

  return (
    <div className="min-h-screen relative" data-admin-page>
      {/* Enhanced navigation with glass effect */}
      <nav className="sticky top-0 z-50 p-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-card rounded-xl backdrop-blur-lg ">
          <div className="px-6 py-4">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link href="/admin" className="flex items-center space-x-3">
                  <Image
                    src={Logo}
                    alt="XMA Progress Logo"
                    className="h-8 w-auto"
                    width={32}
                    height={32}
                  />
                </Link>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                    Clients
                  </Link>
                  <Link href="/admin/my-tasks" className="text-gray-300 hover:text-white transition-colors">
                    My Tasks
                  </Link>
                  <Link href="/admin/team" className="text-gray-300 hover:text-white transition-colors">
                    Team
                  </Link>
                  <Link href="/admin/overview" className="text-gray-300 hover:text-white transition-colors">
                    Overview
                  </Link>
                </nav>
              </div>
              
              <UserDropdown 
                userEmail={user.email || 'User'} 
                userName={teamMember?.name || user.email?.split('@')[0] || 'User'}
                profileImage={teamMember?.profile_image}
              />
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

