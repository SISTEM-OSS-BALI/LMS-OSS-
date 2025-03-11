import { ProfileComponents } from "@/app/components/ProfileComponent";
import { useProfileViewModel } from "./useProfileViewModel";

export default function ProfileComponent() {
  const {
    mergedData,
    isLoading,
    handleUpdate,
    handleUpdateAvatar,
    loading,
    handleSendNotif,
    loadingChangePassword,
  } = useProfileViewModel();

  return (
    <div>
      {mergedData && (
        <ProfileComponents
          data={mergedData}
          isLoading={isLoading}
          loading={loading}
          loadingChangePassword={loadingChangePassword}
          onUpdate={handleUpdate}
          onUpdateAvatar={handleUpdateAvatar}
          onSendEmail={handleSendNotif}
        />
      )}
    </div>
  );
}
