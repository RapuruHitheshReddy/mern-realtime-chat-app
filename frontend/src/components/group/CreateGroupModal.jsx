import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers, clearUsers } from "../../features/user/userSlice";
import { fetchChats } from "../../features/chat/chatSlice";

function CreateGroupModal({ onClose }) {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value) dispatch(clearUsers());
    else dispatch(searchUsers(value));
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const createGroup = async () => {
    if (!groupName || selectedUsers.length < 2) return;

    await fetch("http://localhost:5000/api/chat/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: groupName,
        users: selectedUsers.map((u) => u._id),
      }),
    });

    dispatch(fetchChats());
    dispatch(clearUsers());
    onClose();
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal card */}
      <div className="w-full max-w-md ui-surface p-6 animate-fade-in">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Create group</h3>
          <p className="text-xs text-muted">
            Add at least 2 members to create a group
          </p>
        </div>

        {/* Group name */}
        <div className="mb-3 ui-glass rounded-xl px-3 py-2">
          <input
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* Search users */}
        <div className="mb-3 ui-glass rounded-xl px-3 py-2">
          <input
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            placeholder="Search users"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedUsers.map((u) => (
              <span
                key={u._id}
                onClick={() => toggleUser(u)}
                className="px-3 py-1 rounded-full text-xs cursor-pointer
                           bg-[var(--primary)] text-white hover:opacity-80"
                title="Remove"
              >
                {u.name} ✕
              </span>
            ))}
          </div>
        )}

        {/* User list */}
        <div className="max-h-44 overflow-y-auto space-y-1">
          {users.map((u) => {
            const isSelected = selectedUsers.some(
              (su) => su._id === u._id
            );

            return (
              <div
                key={u._id}
                onClick={() => toggleUser(u)}
                className={`px-3 py-2 rounded-xl cursor-pointer
                  ${
                    isSelected
                      ? "bg-[var(--primary)] text-white"
                      : "hover:bg-[var(--bg-surface-hover)]"
                  }`}
              >
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs opacity-70">{u.email}</p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl
                       text-muted hover:bg-[var(--bg-surface-hover)]"
          >
            Cancel
          </button>

          <button
            onClick={createGroup}
            className="px-4 py-2 text-sm rounded-xl
                       bg-[var(--primary)] text-white
                       hover:opacity-90 disabled:opacity-50"
            disabled={!groupName || selectedUsers.length < 2}
          >
            Create group
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
