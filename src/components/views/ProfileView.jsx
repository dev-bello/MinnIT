import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Badge } from "../ui/badge";
import {
  UserIcon,
  ShieldIcon,
  HomeIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  FileTextIcon,
  PlusIcon,
  LockIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../ui/input";

export const ProfileView = () => {
  const {
    user,
    userProfile,
    updatePersonalInfo,
    updateResidencyInfo,
    updateGuardInfo,
    submitResidencyRequest,
    residencyRequests = [],
    addNotification,
    allUsers,
    setAllUsers,
    setUser,
    updateUserPassword,
  } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isResidencyRequestModalOpen, setIsResidencyRequestModalOpen] =
    useState(false);
  const [editForm, setEditForm] = useState({});
  const [residencyRequestForm, setResidencyRequestForm] = useState({
    type: "maintenance_request",
    issue: "",
    priority: "medium",
  });
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDetails, setRequestDetails] = useState("");

  const [lockedFields, setLockedFields] = useState({
    email: true,
    phone: true,
    apartment: true,
  });
  const [unlockRequests, setUnlockRequests] = useState({});

  // For demo: simulate admin viewing a resident profile
  // In a real app, this would be passed as a prop or via route params
  const viewingResident =
    userProfile?.role === "admin" && userProfile.viewingResident
      ? userProfile.viewingResident
      : null;
  const profileUser = viewingResident || userProfile;

  // Permission toggle for admin
  const [canEdit, setCanEdit] = useState(
    viewingResident ? viewingResident.canEdit : false
  );
  const handleTogglePermission = () => {
    if (!viewingResident) return;
    setCanEdit((prev) => {
      const updated = !prev;
      // Update in allUsers/sessionStorage
      setAllUsers((users) =>
        users.map((u) =>
          u.id === viewingResident.id ? { ...u, canEdit: updated } : u
        )
      );
      return updated;
    });
  };

  const handleEdit = () => {
    if (!profileUser) return;
    if (profileUser.role === "resident") {
      setEditForm({
        email: profileUser.email || "",
        phone: profileUser.phone || "",
        personalInfo: { ...(profileUser.personalInfo || {}) },
        residencyInfo: { ...(profileUser.residencyInfo || {}) },
        password: "",
      });
    } else if (profileUser.role === "guard") {
      setEditForm({
        name: profileUser.name,
        phone: profileUser.phone,
        emergencyContact: profileUser.emergencyContact,
        address: profileUser.address,
      });
    } else if (profileUser.role === "admin") {
      setEditForm({
        name: profileUser.name,
        phone: profileUser.phone,
      });
    }
    setIsEditMode(true);
  };

  const handleSave = async () => {
    if (editForm.password) {
      const { success, error } = await updateUserPassword(editForm.password);
      if (success) {
        addNotification({
          userId: profileUser.id,
          type: "success",
          title: "Password Updated",
          message: "Your password has been successfully updated.",
        });
      } else {
        addNotification({
          userId: profileUser.id,
          type: "error",
          title: "Password Update Failed",
          message: error || "An unknown error occurred.",
        });
      }
    }
    if (profileUser.role === "resident") {
      updatePersonalInfo(
        profileUser.id,
        editForm.personalInfo,
        editForm.email,
        editForm.phone
      );
    } else if (profileUser.role === "guard") {
      updateGuardInfo(profileUser.id, editForm);
    } else if (profileUser.role === "admin") {
      updateGuardInfo(profileUser.id, editForm); // treat admin like guard for now
    }
    setIsEditMode(false);
    setLockedFields({
      email: true,
      phone: true,
      apartment: true,
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  const handleSubmitResidencyRequest = (e) => {
    e.preventDefault();
    const request = {
      ...residencyRequestForm,
      residentId: profileUser.id,
      apartment:
        profileUser.residencyInfo?.apartmentNumber ||
        profileUser.apartmentNumber,
    };
    submitResidencyRequest(request);
    setResidencyRequestForm({
      type: "maintenance_request",
      issue: "",
      priority: "medium",
    });
    setIsResidencyRequestModalOpen(false);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    // Add to resident's own requests (so it appears immediately)
    submitResidencyRequest({
      type: "custom_request",
      title: requestTitle,
      details: requestDetails,
      residentId: profileUser.id,
      apartment:
        profileUser.residencyInfo?.apartmentNumber ||
        profileUser.apartmentNumber,
    });
    // Notify admin
    addNotification({
      userId: "1",
      type: "residency_change_request",
      title: requestTitle,
      message: `${profileUser.name} submitted a request: ${requestTitle} - ${requestDetails}`,
      data: {
        residentId: profileUser.id,
        title: requestTitle,
        details: requestDetails,
      },
    });
    setRequestTitle("");
    setRequestDetails("");
    setIsRequestModalOpen(false);
  };

  const handleUnlockRequest = (field) => {
    const requestId = `${profileUser.id}-${field}`;
    setUnlockRequests((prev) => ({ ...prev, [field]: true }));
    addNotification({
      userId: "1", // Admin ID
      type: "unlock_request",
      title: "Unlock Request",
      message: `${profileUser.name} requests to unlock their ${field}.`,
      data: { residentId: profileUser.id, field },
    });
  };

  // This would be called by an admin action in a real app
  const approveUnlock = (field) => {
    setLockedFields((prev) => ({ ...prev, [field]: false }));
    setUnlockRequests((prev) => ({ ...prev, [field]: false }));
    // Optional: Add a notification to the user
    addNotification({
      userId: profileUser.id,
      type: "unlock_approved",
      title: "Field Unlocked",
      message: `Your ${field} field has been unlocked for editing until you save.`,
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-red-600";
      case "guard":
        return "from-blue-500 to-blue-600";
      case "resident":
        return "from-green-500 to-green-600";
      default:
        return "from-neutral-500 to-neutral-600";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "guard":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "resident":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  // --- Render editable fields for personal info ---
  const renderEditablePersonalInfo = () => {
    if (profileUser.role === "resident") {
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Full Name{" "}
              <span className="text-xs text-neutral-400">
                (Contact admin to change)
              </span>
            </label>
            <Input
              value={profileUser.name}
              readOnly
              className="bg-neutral-100 cursor-not-allowed"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <div className="flex items-center gap-2">
              <Input
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
                disabled={lockedFields.email}
                className={
                  lockedFields.email ? "bg-neutral-100 cursor-not-allowed" : ""
                }
              />
              {lockedFields.email && (
                <Button
                  onClick={() => handleUnlockRequest("email")}
                  size="sm"
                  variant="outline"
                  disabled={unlockRequests.email}
                >
                  <LockIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Phone</label>
            <div className="flex items-center gap-2">
              <Input
                value={editForm.phone || ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, phone: e.target.value }))
                }
                disabled={lockedFields.phone}
                className={
                  lockedFields.phone ? "bg-neutral-100 cursor-not-allowed" : ""
                }
              />
              {lockedFields.phone && (
                <Button
                  onClick={() => handleUnlockRequest("phone")}
                  size="sm"
                  variant="outline"
                  disabled={unlockRequests.phone}
                >
                  <LockIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Gender</label>
            <Input
              value={editForm.personalInfo?.gender || ""}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  personalInfo: { ...f.personalInfo, gender: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Nationality</label>
            <Input
              value={editForm.personalInfo?.nationality || ""}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  personalInfo: {
                    ...f.personalInfo,
                    nationality: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Emergency Contact Name
            </label>
            <Input
              value={editForm.personalInfo?.emergencyContactName || ""}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  personalInfo: {
                    ...f.personalInfo,
                    emergencyContactName: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Emergency Contact
            </label>
            <Input
              value={editForm.personalInfo?.emergencyContact || ""}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  personalInfo: {
                    ...f.personalInfo,
                    emergencyContact: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Emergency Contact Relation
            </label>
            <Input
              value={editForm.personalInfo?.emergencyContactRelation || ""}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  personalInfo: {
                    ...f.personalInfo,
                    emergencyContactRelation: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-3 pt-4 border-t">
            <label className="block text-sm font-medium">Change Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={editForm.password || ""}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>
        </div>
      );
    } else if (profileUser.role === "guard" || profileUser.role === "admin") {
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Name</label>
            <Input
              value={editForm.name || ""}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Phone</label>
            <Input
              value={editForm.phone || ""}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          {profileUser.role === "guard" && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Emergency Contact
                </label>
                <Input
                  value={editForm.emergencyContact || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      emergencyContact: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Address</label>
                <Input
                  value={editForm.address || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // --- Render editable fields for residency info ---
  const renderEditableResidencyInfo = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium">Apartment Number</label>
        <div className="flex items-center gap-2">
          <Input
            value={editForm.residencyInfo?.apartmentNumber || ""}
            onChange={(e) =>
              setEditForm((f) => ({
                ...f,
                residencyInfo: {
                  ...f.residencyInfo,
                  apartmentNumber: e.target.value,
                },
              }))
            }
            disabled={lockedFields.apartment}
            className={
              lockedFields.apartment ? "bg-neutral-100 cursor-not-allowed" : ""
            }
          />
          {lockedFields.apartment && (
            <Button
              onClick={() => handleUnlockRequest("apartment")}
              size="sm"
              variant="outline"
              disabled={unlockRequests.apartment}
            >
              <LockIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium">Block</label>
        <Input
          value={editForm.residencyInfo?.block || ""}
          onChange={(e) =>
            setEditForm((f) => ({
              ...f,
              residencyInfo: { ...f.residencyInfo, block: e.target.value },
            }))
          }
        />
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium">Floor</label>
        <Input
          value={editForm.residencyInfo?.floor || ""}
          onChange={(e) =>
            setEditForm((f) => ({
              ...f,
              residencyInfo: { ...f.residencyInfo, floor: e.target.value },
            }))
          }
        />
      </div>
    </div>
  );

  if (!profileUser) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
          My Profile
        </h2>
        {!isEditMode && (
          <Button onClick={handleEdit} className="button-primary">
            <EditIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
        {isEditMode && (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="button-primary">
              <SaveIcon className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} className="button-secondary">
              <XIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile content based on user role */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${getRoleColor(
                profileUser.role
              )} rounded-2xl flex items-center justify-center shadow-soft`}
            >
              {profileUser.role === "guard" || profileUser.role === "admin" ? (
                <ShieldIcon className="w-8 h-8 text-white" />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h4 className="text-xl font-bold text-neutral-800">
                {profileUser.name}
              </h4>
              <Badge className={getRoleBadgeColor(profileUser.role)}>
                {profileUser.role.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditMode ? (
            renderEditablePersonalInfo()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Static info for all roles */}
              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">
                  Contact Information
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MailIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      {profileUser.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      {profileUser.phone || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="font-semibold text-neutral-800 border-b pb-2">
                  {profileUser.role === "resident"
                    ? "Emergency Contact"
                    : "Account Information"}
                </h5>
                <div className="space-y-3">
                  {profileUser.role === "resident" ? (
                    <>
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          {profileUser.personalInfo?.emergencyContactName ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          {profileUser.personalInfo?.emergencyContact ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-600">
                          {profileUser.personalInfo?.emergencyContactRelation ||
                            "Not specified"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          Member since{" "}
                          {new Date(profileUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          Active Account
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Residency Information Layer */}
      {profileUser.role === "resident" && (
        <>
          <Card className="glass-effect rounded-2xl shadow-soft border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-display text-neutral-800">
                  Residency Information
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="button-secondary"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                  {/* Admin permission toggle button (if admin viewing resident) */}
                  {user.role === "admin" && viewingResident && (
                    <Button
                      onClick={handleTogglePermission}
                      className={
                        canEdit ? "button-secondary" : "button-primary"
                      }
                    >
                      {canEdit ? "Revoke Edit" : "Allow Edit"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-soft">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-neutral-800">
                    {profileUser.residencyInfo?.apartmentNumber ||
                      profileUser.apartmentNumber}
                  </h4>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Active Resident
                  </Badge>
                </div>
              </div>

              {isEditMode ? (
                renderEditableResidencyInfo()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-neutral-800 border-b pb-2">
                      Property Details
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <HomeIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          {profileUser.residencyInfo?.apartmentNumber ||
                            profileUser.apartmentNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-600">
                          Block {profileUser.residencyInfo?.block || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-600">
                          Floor {profileUser.residencyInfo?.floor || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-600">
                          {profileUser.residencyInfo?.apartmentType || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-neutral-800 border-b pb-2">
                      Lease Information
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          {profileUser.residencyInfo?.leaseStartDate
                            ? new Date(
                                profileUser.residencyInfo.leaseStartDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600">
                          {profileUser.residencyInfo?.leaseEndDate
                            ? new Date(
                                profileUser.residencyInfo.leaseEndDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-600">
                          ₦
                          {profileUser.residencyInfo?.monthlyRent?.toLocaleString() ||
                            "N/A"}{" "}
                          /month
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          {profileUser.residencyInfo?.paymentStatus || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Residency Requests - Minimal View */}
          {residencyRequests.filter((req) => req.residentId === profileUser.id)
            .length > 0 && (
            <Card className="glass-effect rounded-2xl shadow-soft border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-display text-neutral-800">
                    Recent Requests
                  </h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {
                      residencyRequests.filter(
                        (req) => req.residentId === profileUser.id
                      ).length
                    }{" "}
                    total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {residencyRequests
                    .filter((req) => req.residentId === profileUser.id)
                    .slice(0, 3) // Show only last 3 requests
                    .map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-xl border"
                      >
                        <div className="flex items-center gap-3">
                          <FileTextIcon className="w-4 h-4 text-neutral-400" />
                          <div>
                            <div className="text-sm font-medium text-neutral-800">
                              {request.title || request.type.replace("_", " ")}
                            </div>
                            {request.details && (
                              <div className="text-xs text-neutral-500 line-clamp-2">
                                {request.details}
                              </div>
                            )}
                            <div className="text-xs text-neutral-500">
                              {new Date(
                                request.submittedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={
                            request.status === "approved"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : request.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                </div>
                {residencyRequests.filter(
                  (req) => req.residentId === profileUser.id
                ).length > 3 && (
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 text-center">
                      +
                      {residencyRequests.filter(
                        (req) => req.residentId === profileUser.id
                      ).length - 3}{" "}
                      more requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Residency Change Request Modal */}
      {isRequestModalOpen && (
        <Modal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        >
          <form onSubmit={handleRequestSubmit} className="space-y-4 p-4">
            <h3 className="text-lg font-bold">Request Residency Change</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="Request title (e.g. Change Apartment)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <textarea
                className="w-full border rounded-xl p-3"
                rows={4}
                placeholder="Describe your request (e.g. change apartment, update lease, etc.)"
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="button-secondary"
              >
                Cancel
              </Button>
              <Button type="submit" className="button-primary">
                Submit
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
