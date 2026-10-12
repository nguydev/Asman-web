import { useState, useEffect } from "react";
import Icon from "./common/Icon.jsx";
import { Button } from "./ui/Button.jsx";
import { userService } from "../api/services/userService.js";
import { fileService } from "../api/services/fileService.js";

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/20">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words">
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function UserDetailModal({ open, onClose, user, onSuspend }) {
  const [fullUser, setFullUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (fileObjectId) => {
    try {
      const res = await fileService.getDownloadUrl(fileObjectId);
      const url = res.data?.data?.url || res.data?.url;
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to download file", err);
      alert("Failed to download file.");
    }
  };

  useEffect(() => {
    if (open && user?.id) {
      const fetchFullUser = async () => {
        setIsLoading(true);
        try {
          const res = await userService.getUser(user.id);
          setFullUser(res.data?.data || res.data);
        } catch (error) {
          console.error("Failed to load full user details", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFullUser();
    } else {
      setFullUser(null);
    }
  }, [open, user]);

  if (!open || !user) return null;

  // Use fullUser if available, fallback to basic user prop
  const data = fullUser || user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-[100rem] flex-col overflow-hidden rounded-none border-0 border-zinc-200 bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:border-zinc-800 dark:bg-zinc-900 md:flex-row sm:h-[95vh] sm:w-[95vw] sm:rounded-2xl sm:border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg bg-white/50 dark:bg-zinc-900/50 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 backdrop-blur"
        >
          <Icon name="close" size={18} />
        </button>

        {/* Left Column - Profile */}
        <div className="w-full md:w-80 lg:w-96 bg-zinc-50 dark:bg-zinc-900/50 p-6 lg:p-8 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col items-center text-center mt-4">
            <div className="relative">
              <img
                src={
                  data.profile?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${data.profile?.name || "User"}&background=random`
                }
                alt={data.profile?.name || "User"}
                className="h-24 w-24 rounded-2xl object-cover shadow-sm ring-4 ring-white dark:ring-zinc-800"
              />
              <span
                className={`absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-full border-4 border-white text-white dark:border-zinc-800 ${data.isDeleted ? "bg-zinc-500" : data.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"}`}
              >
                <Icon name={data.isDeleted ? "ban" : "check"} size={12} />
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {data.profile?.name || "Unknown User"}
            </h2>
            <p className="text-xs text-zinc-500 capitalize">
              {data.role?.toLowerCase() || "User"} ·{" "}
              {data.isDeleted
                ? "Deleted"
                : !data.isEmailVerified
                  ? "Pending"
                  : data.isActive
                    ? "Active"
                    : data.status === "ACTIVE"
                      ? "Normal"
                      : data.status?.toLowerCase() || "Normal"}
            </p>
          </div>

          <div className="mt-8 space-y-4 flex-grow">
            <InfoBox label="Email Address" value={data.email} />
            <InfoBox label="Phone Number" value={data.phone || "N/A"} />
            <InfoBox
              label="Address"
              value={data.profile?.address?.city || "N/A"}
            />
            <InfoBox
              label="Joined Date"
              value={new Date(data.createdAt).toLocaleDateString()}
            />
          </div>

          {!data.isDeleted && data.status !== "SUSPENDED" && (
            <Button
              variant="danger"
              className="mt-6 w-full"
              onClick={() => onSuspend?.(data)}
            >
              Suspend Access
            </Button>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="flex-1 p-6 lg:p-10 h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <div className="flex flex-col items-center gap-2">
                <Icon
                  name="spinner"
                  className="animate-spin text-brand"
                  size={32}
                />
                <p>Loading user details...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Organizations */}
              <div className="xl:col-span-2">
                <Section title="Organizations & Affiliations">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owned Orgs */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="flex items-center gap-2 mb-3 text-brand">
                        <Icon name="building" size={16} />
                        <span className="font-semibold text-sm">
                          Owned Organizations
                        </span>
                      </div>
                      {data.createdOrganizations?.length > 0 ? (
                        <div className="space-y-2">
                          {data.createdOrganizations.map((org) => (
                            <div
                              key={org.id}
                              className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-2 px-3 rounded-lg text-sm"
                            >
                              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                                {org.name}
                              </span>
                              <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                                {org.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400">
                          No owned organizations.
                        </p>
                      )}
                    </div>
                    {/* Member Orgs */}
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="flex items-center gap-2 mb-3 text-blue-500">
                        <Icon name="users" size={16} />
                        <span className="font-semibold text-sm">
                          Organization Memberships
                        </span>
                      </div>
                      {data.organizationMembers?.length > 0 ? (
                        <div className="space-y-2">
                          {data.organizationMembers.map((mem, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-2 px-3 rounded-lg text-sm"
                            >
                              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                                {mem.organization?.name}
                              </span>
                              <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                                {mem.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400">
                          No memberships found.
                        </p>
                      )}
                    </div>
                  </div>
                </Section>
              </div>

              {/* Driver Details & Vault */}
              {data.driver ? (
                <>
                  <Section title="Driver Information">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoBox
                        label="License Number"
                        value={data.driver.licenseNumber || "N/A"}
                      />
                      <InfoBox
                        label="State"
                        value={data.driver.state || "N/A"}
                      />
                      <InfoBox
                        label="Status"
                        value={data.driver.status || "N/A"}
                      />
                      <InfoBox
                        label="Driver ID"
                        value={data.driver.id.split("-")[0]}
                      />
                    </div>
                  </Section>

                  <Section title="Document Vault">
                    {data.driver.vaultDocuments?.length > 0 ? (
                      <div className="space-y-2">
                        {data.driver.vaultDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() =>
                              doc.fileObjectId &&
                              handleDownload(doc.fileObjectId)
                            }
                            className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-brand/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group"
                          >
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-200/50 dark:bg-zinc-900/50 text-zinc-400 group-hover:text-brand transition-colors">
                              <Icon name="file" size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-brand transition-colors">
                                {doc.fileObject?.originalName ||
                                  doc.name ||
                                  "Document"}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                              <Icon
                                name="download"
                                size={16}
                                className="text-brand"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500">
                        <Icon name="folder" size={16} />
                        <span className="text-sm">Vault is empty.</span>
                      </div>
                    )}
                  </Section>
                </>
              ) : (
                <div className="xl:col-span-2">
                  <Section title="Driver Information & Vault">
                    <div className="flex items-center justify-center p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-sm">
                      This user is not registered as a driver.
                    </div>
                  </Section>
                </div>
              )}

              {/* Cases */}
              <div className="xl:col-span-2">
                <Section title="Recent Cases">
                  {data.driver?.cases && data.driver.cases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-300 rounded-tl-lg">
                              Case ID
                            </th>
                            <th className="px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-300">
                              Status
                            </th>
                            <th className="px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-300 rounded-tr-lg">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {data.driver?.cases.map((c) => (
                            <tr key={c.id}>
                              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 uppercase">
                                #{c.id.split("-")[0]}
                              </td>

                              <td className="px-4 py-3">{c.status}</td>
                              <td className="px-4 py-3 text-zinc-500">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 text-sm">
                      No cases initiated by this user.
                    </div>
                  )}
                </Section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
