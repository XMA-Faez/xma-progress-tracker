import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-300">Manage your profile information and preferences</p>
      </div>

      <ProfileForm 
        user={user} 
        teamMember={teamMember} 
      />
    </div>
  );
}