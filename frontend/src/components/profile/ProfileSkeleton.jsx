function ProfileSkeleton() {
  return (
    <div className="w-full max-w-md ui-surface rounded-3xl p-6 space-y-6">
      <div className="h-4 w-24 skeleton" />

      <div className="flex flex-col items-center gap-4">
        <div className="w-28 h-28 rounded-full skeleton" />
        <div className="h-4 w-32 skeleton" />
        <div className="h-3 w-24 skeleton" />
      </div>

      <div className="h-20 w-full skeleton rounded-xl" />
    </div>
  );
}

export default ProfileSkeleton;
