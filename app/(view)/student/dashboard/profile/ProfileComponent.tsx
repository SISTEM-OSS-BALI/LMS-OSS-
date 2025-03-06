import { ProfileComponents } from "@/app/components/ProfileComponent";
import { useProfileViewModel } from "./useProfileViewModel";

export default function ProfileComponent() {
  const { profileData, isLoading } = useProfileViewModel();
  return (
    <div>
      {profileData && (
        <ProfileComponents data={profileData.data} isLoading={isLoading} onUpdate={(updatedData) => { /* handle update */ }} />
      )}
    </div>
  );
}
