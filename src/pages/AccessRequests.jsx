// Access requests management page
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, ConfirmDialog } from "../components/ui";
import Icon from "../components/Icon";
import { CLEARANCE } from "../data/enums";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


export default function AccessRequests() {
  const { t, users, pendingUsers, approveUser, rejectUser, isCommander } = useApp();
  const { toastSuccess, toastError } = useToast();

  const [confirmReject, setConfirmReject] = useState(null);

  if (!isCommander) {
    return (
      <div className="space-y-4">
        <PageHeader title={t("nav.access")} icon="access" />
        <div className="card p-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-danger-600/10 text-danger-600">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">Commander Access Required</p>
          <p className="mt-1 text-xs text-gray-500">
            Only commanders can review and approve access requests.
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = (user) => {
    approveUser(user.id);

    toastSuccess(`${user.name} approved`);
  };


  const handleReject = (user) => {
    rejectUser(user.id);

    toastError(`${user.name} rejected`);
    setConfirmReject(null);
  };


  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.access")} icon="access" />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Icon name="clock" className="h-4 w-4 text-warn-500" />
          {t("access.pending")}
          {pendingUsers.length > 0 && (
            <Badge tone="warn">{pendingUsers.length}</Badge>
          )}
        </h2>

        {pendingUsers.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-500">{t("access.empty")}</div>
        ) : (
          <div className="space-y-2">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name="users" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge tone="brand">
                        {CLEARANCE[user.clearance_level] || user.clearance_level}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {t("access.requestedAt")} {formatDate(user.requestedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user)}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      {t("access.approve")}
                    </span>
                  </button>
                  <button
                    onClick={() => setConfirmReject(user)}
                    className="btn-danger px-3 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name="close" className="h-3.5 w-3.5" />
                      {t("access.reject")}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Icon name="shield" className="h-4 w-4 text-brand-600" />
          {t("access.approved")}
          {users.length > 0 && <Badge tone="gray">{users.length}</Badge>}
        </h2>

        {users.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-500">{t("common.noData")}</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3 font-medium">{t("access.name")}</th>
                    <th className="px-4 py-3 font-medium">{t("access.email")}</th>
                    <th className="px-4 py-3 font-medium">{t("access.role")}</th>
                    <th className="px-4 py-3 font-medium">{t("access.approved")}</th>
                    <th className="px-4 py-3 font-medium">{t("access.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-300/10 last:border-0">
                      <td className="px-4 py-3 text-gray-700">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={user.clearance_level === "COMMANDER" ? "brand" : "gray"}>
                          {CLEARANCE[user.clearance_level] || user.clearance_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(user.requestedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="ok">{t("access.approved")}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!confirmReject}
        title="Reject Access Request"
        message={`Reject access request from ${confirmReject?.name}? This cannot be undone.`}
        confirmLabel={t("access.reject")}
        tone="danger"
        onConfirm={() => handleReject(confirmReject)}
        onClose={() => setConfirmReject(null)}
      />
    </div>
  );
}
