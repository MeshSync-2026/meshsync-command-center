// Squads management page with members and zone assignment
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, Modal, ConfirmDialog, EmptyState } from "../components/ui";
import Icon from "../components/Icon";
import { SQUAD_ROLE } from "../data/enums";
import { authorities } from "../data/mockData";

const ROLE_KEYS = Object.keys(SQUAD_ROLE);

export default function Squads() {
  const { t, isCommander } = useApp();
  const {
    squads,
    squadMembers,
    zones,
    createSquad,
    deleteSquad,
    assignSquadToZone,
    addSquadMember,
    removeSquadMember,
  } = useData();
  const { toastSuccess, toastError } = useToast();

  const [showNew, setShowNew] = useState(false);
  const [detailSquad, setDetailSquad] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newForm, setNewForm] = useState({
    squad_name: "",
    leader_authority_user_id: "",
    zone_id: "",
  });
  const [memberForm, setMemberForm] = useState({
    authority_user_id: "",
    role_in_squad: SQUAD_ROLE.LEADER,
  });

  const authorityName = (id) => authorities.find((a) => a.id === id)?.name ?? "—";
  const zoneName = (id) => zones.find((z) => z.id === id)?.name ?? t("squad.unassigned");
  const membersOf = (squadId) => squadMembers.filter((m) => m.squad_id === squadId);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newForm.squad_name.trim() || !newForm.leader_authority_user_id) {
      toastError("Squad name and leader are required");
      return;
    }

    const squad = createSquad({
      squad_name: newForm.squad_name.trim(),
      leader_authority_user_id: newForm.leader_authority_user_id,
      zone_id: newForm.zone_id || null,
    });

    addSquadMember({
      squad_id: squad.id,
      authority_user_id: newForm.leader_authority_user_id,
      role_in_squad: SQUAD_ROLE.LEADER,
    });

    toastSuccess(`Squad "${squad.squad_name}" created`);
    setShowNew(false);
    setNewForm({ squad_name: "", leader_authority_user_id: "", zone_id: "" });
  };


  const handleAssignZone = (squadId, zoneId) => {
    assignSquadToZone(squadId, zoneId || null);
    toastSuccess(zoneId ? "Zone assigned" : "Zone unassigned");
  };


  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberForm.authority_user_id) {
      toastError("Select a responder to add");
      return;
    }

    addSquadMember({
      squad_id: detailSquad.id,
      authority_user_id: memberForm.authority_user_id,
      role_in_squad: memberForm.role_in_squad,
    });

    toastSuccess("Member added");
    setShowAddMember(false);
    setMemberForm({ authority_user_id: "", role_in_squad: SQUAD_ROLE.LEADER });
  };

  const handleRemoveMember = (memberId) => {
    removeSquadMember(memberId);

    toastSuccess("Member removed");
  };

  const handleDelete = () => {
    deleteSquad(confirmDelete.id);

    toastSuccess("Squad deleted");
    setConfirmDelete(null);
    setDetailSquad(null);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("squad.title")}
        action={
          <button className="btn-primary" onClick={() => setShowNew(true)}>
            <Icon name="plus" className="w-4 h-4 mr-1.5" />
            {t("squad.new")}
          </button>
        }
      />

      {squads.length === 0 ? (
        <EmptyState icon="squads" message={t("squad.empty")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((squad) => {
            const count = membersOf(squad.id).length;
            return (
              <div key={squad.id} className="card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {squad.squad_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("squad.leader")}: {authorityName(squad.leader_authority_user_id)}
                    </p>
                  </div>
                  <Badge tone={squad.is_active ? "ok" : "gray"}>
                    {squad.is_active ? t("squad.active") : t("squad.inactive")}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="users" className="w-4 h-4 text-brand-600" />
                  <span>{t("squad.memberCount", { count })}</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t("squad.zone")}</label>
                  <select
                    className="select"
                    value={squad.zone_id ?? ""}
                    onChange={(e) => handleAssignZone(squad.id, e.target.value)}
                  >
                    <option value="">{t("squad.unassigned")}</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button className="btn-secondary flex-1" onClick={() => setDetailSquad(squad)}>
                    <Icon name="users" className="w-4 h-4 mr-1.5" />
                    {t("squad.members")}
                  </button>
                  {isCommander && (
                    <button
                      className="btn-danger"
                      onClick={() => setConfirmDelete(squad)}
                      title={t("squad.delete")}
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title={t("squad.new")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              {t("squad.name")}
            </label>
            <input
              className="input"
              value={newForm.squad_name}
              onChange={(e) => setNewForm({ ...newForm, squad_name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t("squad.leader")}</label>
            <select
              className="select"
              value={newForm.leader_authority_user_id}
              onChange={(e) => setNewForm({ ...newForm, leader_authority_user_id: e.target.value })}
              required
            >
              <option value="">—</option>
              {authorities.filter((a) => a.status === "APPROVED").map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t("squad.zone")}</label>
            <select
              className="select"
              value={newForm.zone_id}
              onChange={(e) => setNewForm({ ...newForm, zone_id: e.target.value })}
            >
              <option value="">{t("squad.unassigned")}</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowNew(false)}>{t("common.cancel")}</button>
            <button type="submit" className="btn-primary">{t("common.save")}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailSquad} onClose={() => setDetailSquad(null)} title={detailSquad?.squad_name}>
        {detailSquad && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="text-gray-600">{t("squad.zone")}: </span>
                {zoneName(detailSquad.zone_id)}
              </div>
              <button className="btn-secondary" onClick={() => setShowAddMember(true)}>
                <Icon name="plus" className="w-4 h-4 mr-1.5" />
                {t("squad.addMember")}
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {membersOf(detailSquad.id).length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">{t("common.noData")}</p>
              ) : (
                membersOf(detailSquad.id).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {authorityName(m.authority_user_id)}
                      </p>
                      <p className="text-xs text-gray-500">{m.role_in_squad}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={m.is_active ? "ok" : "gray"}>
                        {m.is_active ? t("squad.active") : t("squad.inactive")}
                      </Badge>
                      <button
                        className="btn-ghost text-danger-600 hover:text-danger-500"
                        onClick={() => handleRemoveMember(m.id)}
                        title={t("squad.removeMember")}
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn-ghost" onClick={() => setDetailSquad(null)}>{t("common.close")}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title={t("squad.addMember")}>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Responder</label>
            <select
              className="select"
              value={memberForm.authority_user_id}
              onChange={(e) => setMemberForm({ ...memberForm, authority_user_id: e.target.value })}
              required
            >
              <option value="">—</option>
              {authorities.filter((a) => a.status === "APPROVED").map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t("squad.role")}</label>
            <select
              className="select"
              value={memberForm.role_in_squad}
              onChange={(e) => setMemberForm({ ...memberForm, role_in_squad: e.target.value })}
            >
              {ROLE_KEYS.map((k) => (
                <option key={k} value={SQUAD_ROLE[k]}>
                  {SQUAD_ROLE[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setShowAddMember(false)}>{t("common.cancel")}</button>
            <button type="submit" className="btn-primary">{t("common.save")}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title={t("squad.delete")}
        message={t("squad.confirmDelete")}
        confirmLabel={t("common.delete")}
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
