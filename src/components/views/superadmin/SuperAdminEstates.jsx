import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Modal } from "../../ui/modal";
import { db } from "../../../lib/supabase";
import { RefreshCwIcon, SearchIcon, FilterIcon, PlusIcon } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export const SuperAdminEstates = () => {
  const { user } = useAuth();
  // Create Estate Form State
  const [estateForm, setEstateForm] = useState({
    name: "",
    subdomain: "",
    address: "",
    city: "",
    state: "",
    country: "",
    contact_email: "",
    contact_phone: "",
  });
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Drafts State
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);

  const DRAFTS_KEY = "estate_drafts";
  const readDrafts = () => {
    try {
      return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const writeDrafts = (next) => {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
  };
  const openDrafts = () => {
    setDrafts(readDrafts());
    setIsDraftsOpen(true);
  };
  const saveDraft = () => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    const next = [
      { id, createdAt, estateForm, adminForm },
      ...readDrafts(),
    ].slice(0, 50);
    writeDrafts(next);
    setSuccessMsg("Draft saved locally");
  };
  const deleteDraft = (id) => {
    const next = readDrafts().filter((d) => d.id !== id);
    writeDrafts(next);
    setDrafts(next);
  };
  const loadDraft = (id) => {
    const d = readDrafts().find((x) => x.id === id);
    if (!d) return;
    setEstateForm(d.estateForm || {});
    setAdminForm(d.adminForm || {});
    setIsDraftsOpen(false);
    setSuccessMsg("Draft loaded");
  };

  const handleEstateChange = (e) => {
    setEstateForm({ ...estateForm, [e.target.name]: e.target.value });
  };
  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      console.log("Submitting data:", { estateForm, adminForm });
      const { data, error } = await db.functions.invoke(
        "create-estate-and-admin",
        {
          body: {
            estate_name: estateForm.name,
            admin_email: adminForm.email,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMsg("Estate and admin created successfully! Invitation sent.");
      // Reset forms
      setEstateForm({
        name: "",
        subdomain: "",
        address: "",
        city: "",
        state: "",
        country: "",
        contact_email: "",
        contact_phone: "",
      });
      setAdminForm({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Detailed error:", err);
      setErrorMsg("Failed to create estate/admin. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Create Estate
            </h2>
            <p className="text-neutral-500 text-sm">
              Add a new estate and its designated admin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={openDrafts}
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 shrink-0"
            >
              View Drafts
            </Button>
          </div>
        </div>

        <Card className="w-full bg-white border border-neutral-200 shadow-sm">
          <CardHeader className="text-center pb-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              Create Estate & Admin
            </h1>
            <p className="text-neutral-500">
              Add a new estate and its designated admin
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">
                  Estate Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    value={estateForm.name}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="Estate Name"
                    required
                  />
                  <input
                    name="subdomain"
                    value={estateForm.subdomain}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="Subdomain (e.g. estateA)"
                    required
                  />
                  <input
                    name="address"
                    value={estateForm.address}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="Address"
                    required
                  />
                  <input
                    name="city"
                    value={estateForm.city}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="City"
                    required
                  />
                  <input
                    name="state"
                    value={estateForm.state}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="State"
                    required
                  />
                  <input
                    name="country"
                    value={estateForm.country}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="Country"
                    required
                  />
                  <input
                    name="contact_email"
                    value={estateForm.contact_email}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="Contact Email"
                    required
                  />
                  <input
                    name="contact_phone"
                    value={estateForm.contact_phone}
                    onChange={handleEstateChange}
                    className="input-modern"
                    placeholder="Contact Phone"
                    required
                  />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">
                  Admin Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    value={adminForm.name}
                    onChange={handleAdminChange}
                    className="input-modern"
                    placeholder="Admin Name"
                    required
                  />
                  <input
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminChange}
                    className="input-modern"
                    placeholder="Admin Email"
                    required
                  />
                  <input
                    name="phone"
                    value={adminForm.phone}
                    onChange={handleAdminChange}
                    className="input-modern"
                    placeholder="Admin Phone"
                    required
                  />
                </div>
              </div>
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 text-base font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-200"
                >
                  {isLoading ? "Creating..." : "Create Estate & Admin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Drafts Modal */}
      <Modal
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        size="md"
        title="Drafts"
        align="start"
      >
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          {drafts.length === 0 ? (
            <div className="text-neutral-500">No drafts yet</div>
          ) : (
            <div className="space-y-3">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-neutral-800">
                      {d.estateForm?.name || "Untitled Estate"}
                    </div>
                    <div className="text-neutral-500">
                      {new Date(d.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => loadDraft(d.id)}
                      className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    >
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteDraft(d.id)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
