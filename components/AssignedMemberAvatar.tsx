import { TeamMember } from "@/types";
import { ColorScheme } from "@/lib/colors";

interface AssignedMemberAvatarProps {
  member: TeamMember;
  colorMap?: Map<string, ColorScheme>;
  size?: 'xs' | 'sm' | 'md';
}

export function AssignedMemberAvatar({ member, colorMap, size = 'sm' }: AssignedMemberAvatarProps) {
  const memberColor = colorMap?.get(member.id);
  
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5', 
    md: 'w-6 h-6'
  };

  return (
    <>
      <div
        className={`${sizeClasses[size]} rounded-full border flex items-center justify-center ${
          memberColor 
            ? `${memberColor.bg} ${memberColor.border}` 
            : 'bg-gray-600/30 border-gray-500/50'
        }`}
        title={member.name}
      >
        <span className={`text-xs font-medium ${
          memberColor ? memberColor.text : 'text-gray-300'
        }`}>
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <span className={`text-xs font-medium ${
        memberColor ? memberColor.text : 'text-gray-300'
      }`}>
        {member.name.split(" ")[0]}
      </span>
    </>
  );
}