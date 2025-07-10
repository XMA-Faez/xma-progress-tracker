import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

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
    <div data-admin-page>
      <DashboardLayout
        userEmail={user.email || 'User'}
        userName={teamMember?.name || user.email?.split('@')[0] || 'User'}
        profileImage={teamMember?.profile_image}
      >
        {children}
      </DashboardLayout>
    </div>
  );
}

