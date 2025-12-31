import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { fetchPublicProfile } from "../features/profile/profileSlice";
import PublicProfileCard from "../components/profile/PublicProfileCard";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";

/**
 * PublicProfile
 * - Route-level page for viewing another user's public profile
 * - Handles data loading and basic error states
 */
function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { publicUser, loading } = useSelector((state) => state.profile);

  /* ---------------- Fetch public profile ---------------- */
  useEffect(() => {
    if (!id) return;

    dispatch(fetchPublicProfile(id))
      .unwrap()
      .catch(() => {
        toast.error(
          typeof err === "string" ? err : err?.message || "Something went wrong"
        );
      });
  }, [dispatch, id]);

  /* ---------------- Loading state ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <ProfileSkeleton />
      </div>
    );
  }

  /* ---------------- Not found ---------------- */
  if (!publicUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] text-muted">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center px-4">
      <PublicProfileCard user={publicUser} onBack={() => navigate(-1)} />
    </div>
  );
}

export default PublicProfile;
