import React from "react";
import { Button } from "../../components/ui/button";
import { NotificationDropdown } from "../../components/ui/notification";
import { MenuIcon, XIcon, UserIcon, LogOutIcon } from "lucide-react";

export const MobileHeader = ({
  user,
  sidebarOpen,
  onSidebarToggle,
  onProfileClick,
  onLogoutClick,
  getRoleColor,
  getRoleBadgeColor,
}) => {
  return (
    <div className="lg:hidden glass-effect rounded-2xl p-4 mb-4 sm:mb-6 shadow-soft border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold font-display gradient-text">
            MinnIT NG
          </h1>
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={onProfileClick}
                className={`w-8 h-8 bg-gradient-to-br ${getRoleColor(
                  user.role
                )} rounded-xl flex items-center justify-center shadow-soft hover:shadow-md transition-shadow cursor-pointer`}
              >
                <UserIcon className="w-4 h-4 text-white" />
              </button>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-neutral-800 truncate">
                  {user.name}
                </div>
                <div
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Button
              onClick={onLogoutClick}
              variant="outline"
              size="sm"
              className="p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors"
              title="Logout"
            >
              <LogOutIcon className="w-4 h-4" />
            </Button>
          )}
          <NotificationDropdown />
          <button
            onClick={onSidebarToggle}
            className="menu-button p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-colors"
          >
            {sidebarOpen ? (
              <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
