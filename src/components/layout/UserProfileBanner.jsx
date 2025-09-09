import React from "react";

export const UserProfileBanner = ({ userProfile }) => {
  if (!userProfile) {
    return null;
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-white/80 shadow border border-neutral-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
      <div>
        <div className="text-lg font-bold">
          Welcome, {userProfile.full_name || "User"}!
        </div>
        <div className="text-sm text-neutral-700">
          Role: <span className="font-semibold">{userProfile.role}</span>
        </div>
        {userProfile.email && (
          <div className="text-sm text-neutral-700">
            Email: <span className="font-mono">{userProfile.email}</span>
          </div>
        )}
        {userProfile.unique_id && (
          <div className="text-sm text-neutral-700">
            Unique ID:{" "}
            <span className="font-mono">{userProfile.unique_id}</span>
          </div>
        )}
        {userProfile.phone && (
          <div className="text-sm text-neutral-700">
            Phone: <span className="font-mono">{userProfile.phone}</span>
          </div>
        )}
        {userProfile.permissions && (
          <div className="text-sm text-neutral-700">
            Permissions:{" "}
            <span className="font-mono">
              {JSON.stringify(userProfile.permissions)}
            </span>
          </div>
        )}
        {userProfile.estate && (
          <div className="text-sm text-neutral-700">
            Estate:{" "}
            <span className="font-mono">
              {userProfile.estate?.name || JSON.stringify(userProfile.estate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
