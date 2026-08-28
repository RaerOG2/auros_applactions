"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createServerRole,
  deleteServerRole,
  getServerRoles,
  reorderServerRoles,
  assignRoleToMember,
  removeRoleFromMember,
  getMemberRoles,
  updateServerRole,
  type ServerRole,
} from "../../services/server-admin.service";

import type { ChatUserProfile } from "../../types/chat";

type ChatServerSettingsModalProps = {
  open: boolean;
  serverId: string | null;
  members: ChatUserProfile[];
  currentName?: string;
  currentDescription?: string | null;
  onClose: () => void;
  onSave: (input: {
    name?: string;
    description?: string | null;
    iconFile?: File | null;
  }) => Promise<void>;
};


type Tab = "general" | "roles" | "members";

type PermissionKey =
  | "canManageServer"
  | "canManageChannels"
  | "canManageRoles"
  | "canKickMembers"
  | "canBanMembers"
  | "canMuteMembers"
  | "canManageMessages";

type RoleDraft = {
  name: string;
  color: string;
  icon: string;
  groupName: string;
  position: number;
  locked: boolean;
  adminOnly: boolean;
  canManageServer: boolean;
  canManageChannels: boolean;
  canManageRoles: boolean;
  canKickMembers: boolean;
  canBanMembers: boolean;
  canMuteMembers: boolean;
  canManageMessages: boolean;
  
};

const permissions: readonly [PermissionKey, string][] = [
  ["canManageServer", "Manage Server"],
  ["canManageChannels", "Manage Channels"],
  ["canManageRoles", "Manage Roles"],
  ["canKickMembers", "Kick Members"],
  ["canBanMembers", "Ban Members"],
  ["canMuteMembers", "Mute Members"],
  ["canManageMessages", "Manage Messages"],
];

const emptyRoleDraft: RoleDraft = {
  name: "",
  color: "#d4af37",
  icon: "⭐",
  groupName: "Default",
  position: 0,
  locked: false,
  adminOnly: false,
  canManageServer: false,
  canManageChannels: false,
  canManageRoles: false,
  canKickMembers: false,
  canBanMembers: false,
  canMuteMembers: false,
  canManageMessages: false,
};

function roleToDraft(role: ServerRole): RoleDraft {
  return {
    name: role.name,
    color: role.color,
    icon: role.icon ?? "⭐",
    groupName: role.groupName ?? "Default",
    position: role.position ?? 0,
    locked: role.locked ?? false,
    adminOnly: role.adminOnly ?? false,
    canManageServer: role.canManageServer,
    canManageChannels: role.canManageChannels,
    canManageRoles: role.canManageRoles,
    canKickMembers: role.canKickMembers,
    canBanMembers: role.canBanMembers,
    canMuteMembers: role.canMuteMembers,
    canManageMessages: role.canManageMessages,
  };
}

export default function ChatServerSettingsModal({
  open,
  serverId,
  members,
  currentName,
  currentDescription,
  onClose,
  onSave,
}: ChatServerSettingsModalProps) {
  const [tab, setTab] = useState<Tab>("general");

  const [name, setName] = useState(currentName ?? "");
  const [description, setDescription] = useState(currentDescription ?? "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(emptyRoleDraft);
  const [isCreatingRole, setIsCreatingRole] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesSaving, setRolesSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberRoleMap, setMemberRoleMap] = useState<Record<string, string[]>>({});
  const [memberRolesLoading, setMemberRolesLoading] = useState(false);

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? null;

  const roleGroups = useMemo(() => {
    const groups = Array.from(
      new Set(roles.map((role) => role.groupName || "Default"))
    );

    if (!groups.includes("Default")) groups.unshift("Default");

    return groups;
  }, [roles]);

  const groupedRoles = useMemo(() => {
    return roles.reduce<Record<string, ServerRole[]>>((acc, role) => {
      const group = role.groupName || "Default";
      if (!acc[group]) acc[group] = [];
      acc[group].push(role);
      return acc;
    }, {});
  }, [roles]);

  useEffect(() => {
    if (!open) return;

    setName(currentName ?? "");
    setDescription(currentDescription ?? "");
    setIconFile(null);
    setTab("general");
  }, [open, currentName, currentDescription]);

  useEffect(() => {
  if (!open || !serverId || members.length === 0) return;

  let isMounted = true;
  const safeServerId = serverId;

  async function loadMemberRoles() {
    try {
      setMemberRolesLoading(true);

      const entries = await Promise.all(
        members.map(async (member) => {
          const roleIds = await getMemberRoles(safeServerId, member.id).catch(
            () => []
          );

          return [member.id, roleIds] as const;
        })
      );

      if (!isMounted) return;

      setMemberRoleMap(Object.fromEntries(entries));
    } finally {
      if (isMounted) {
        setMemberRolesLoading(false);
      }
    }
  }

  loadMemberRoles();

  return () => {
    isMounted = false;
  };
}, [open, serverId, members]);

async function toggleMemberRole(userId: string, roleId: string) {
  if (!serverId) return;

  const currentRoles = memberRoleMap[userId] ?? [];
  const hasRole = currentRoles.includes(roleId);

  try {
    if (hasRole) {
      await removeRoleFromMember({
        serverId,
        userId,
        roleId,
      });

      setMemberRoleMap((prev) => ({
        ...prev,
        [userId]: currentRoles.filter((id) => id !== roleId),
      }));

      return;
    }

    await assignRoleToMember({
      serverId,
      userId,
      roleId,
    });

    setMemberRoleMap((prev) => ({
      ...prev,
      [userId]: [...currentRoles, roleId],
    }));
  } catch (error) {
    console.warn("[ChatServerSettingsModal] Failed to update member role:", error);
  }
}

  useEffect(() => {
    if (!open || !serverId) return;

    const safeServerId = serverId;
    let isMounted = true;

    async function loadRoles() {
      try {
        setRolesLoading(true);

        const loadedRoles = await getServerRoles(safeServerId);

        if (!isMounted) return;

        setRoles(loadedRoles);
        setSelectedRoleId(null);
        setDraft(emptyRoleDraft);
        setIsCreatingRole(true);
      } finally {
        if (isMounted) setRolesLoading(false);
      }
    }

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, [open, serverId]);

  if (!open) return null;

  function startCreateRole(groupName?: string) {
    setSelectedRoleId(null);
    setIsCreatingRole(true);
    setDraft({
      ...emptyRoleDraft,
      groupName: groupName || "Default",
    });
  }

  function startEditRole(role: ServerRole) {
    setSelectedRoleId(role.id);
    setIsCreatingRole(false);
    setDraft(roleToDraft(role));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      await onSave({
        name: name.trim() || undefined,
        description: description.trim() || null,
        iconFile,
      });

      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveRole() {
    if (!serverId) return;

    const roleName = draft.name.trim();
    if (!roleName) return;

    try {
      setRolesSaving(true);

      if (isCreatingRole) {
        const groupRoles = roles.filter(
          (role) => (role.groupName || "Default") === draft.groupName
        );

        const created = await createServerRole({
          serverId,
          name: roleName,
          color: draft.color,
          icon: draft.icon.trim() || null,
          groupName: draft.groupName.trim() || "Default",
          position: groupRoles.length,
          locked: draft.locked,
          adminOnly: draft.adminOnly,
        });

        const updated = await updateServerRole(created.id, {
          canManageServer: draft.canManageServer,
          canManageChannels: draft.canManageChannels,
          canManageRoles: draft.canManageRoles,
          canKickMembers: draft.canKickMembers,
          canBanMembers: draft.canBanMembers,
          canMuteMembers: draft.canMuteMembers,
          canManageMessages: draft.canManageMessages,
        });

        setRoles((prev) => [...prev, updated]);
        startEditRole(updated);
        return;
      }

      if (!selectedRole) return;

      const updated = await updateServerRole(selectedRole.id, {
        name: roleName,
        color: draft.color,
        icon: draft.icon.trim() || null,
        groupName: draft.groupName.trim() || "Default",
        position: draft.position,
        locked: draft.locked,
        adminOnly: draft.adminOnly,
        canManageServer: draft.canManageServer,
        canManageChannels: draft.canManageChannels,
        canManageRoles: draft.canManageRoles,
        canKickMembers: draft.canKickMembers,
        canBanMembers: draft.canBanMembers,
        canMuteMembers: draft.canMuteMembers,
        canManageMessages: draft.canManageMessages,
      });

      setRoles((prev) =>
        prev.map((role) => (role.id === updated.id ? updated : role))
      );

      startEditRole(updated);
    } finally {
      setRolesSaving(false);
    }
  }

  async function handleDeleteSelectedRole() {
    if (!selectedRole) return;

    try {
      setRolesSaving(true);

      await deleteServerRole(selectedRole.id);

      setRoles((prev) => prev.filter((role) => role.id !== selectedRole.id));
      setDeleteConfirmOpen(false);
      startCreateRole();
    } finally {
      setRolesSaving(false);
    }
  }

  async function moveRole(roleId: string, direction: "up" | "down") {
    const role = roles.find((item) => item.id === roleId);
    if (!role) return;

    const groupName = role.groupName || "Default";

    const groupRoles = roles
      .filter((item) => (item.groupName || "Default") === groupName)
      .sort((a, b) => a.position - b.position);

    const currentIndex = groupRoles.findIndex((item) => item.id === roleId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= groupRoles.length) return;

    const reordered = [...groupRoles];
    const [movedRole] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedRole);

    const updatedGroupRoles = reordered.map((item, index) => ({
      ...item,
      position: index,
    }));

    const nextRoles = roles.map((item) => {
      const updated = updatedGroupRoles.find((roleItem) => roleItem.id === item.id);
      return updated ?? item;
    });

    setRoles(nextRoles);

    const updatedSelected = nextRoles.find((item) => item.id === selectedRoleId);
    if (updatedSelected) {
      setDraft(roleToDraft(updatedSelected));
    }

    await reorderServerRoles({
      roles: updatedGroupRoles.map((item) => ({
        roleId: item.id,
        position: item.position,
        groupName: item.groupName || "Default",
      })),
    });
  }

  function updateDraftPermission(key: PermissionKey, checked: boolean) {
    setDraft((prev) => ({
      ...prev,
      [key]: checked,
    }));
  }

  const compactButtonStyle: React.CSSProperties = {
    minHeight: 38,
    height: 38,
    padding: "0 12px",
    borderRadius: 14,
  };

  return (
    <>
      <div className="aurosModalOverlay">
        <div
          className="aurosModalCard"
          style={{
            width: "min(96vw, 1180px)",
            maxWidth: 1180,
            maxHeight: "92vh",
            overflow: "auto",
          }}
        >
          <div className="aurosModalHeader">
            <div>
              <p className="aurosPanelOverline">SERVER SETTINGS</p>
              <h3 className="aurosModalTitle">Edit server</h3>
            </div>

            <button type="button" className="aurosModalClose" onClick={onClose}>
              ×
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              className={tab === "general" ? "aurosModalPrimary" : "aurosModalSecondary"}
              onClick={() => setTab("general")}
              style={compactButtonStyle}
            >
              General
            </button>

            <button
              type="button"
              className={tab === "roles" ? "aurosModalPrimary" : "aurosModalSecondary"}
              onClick={() => setTab("roles")}
              style={compactButtonStyle}
            >
              Roles
            </button>

            <button
              type="button"
              className={tab === "members" ? "aurosModalPrimary" : "aurosModalSecondary"}
              onClick={() => setTab("members")}
              style={compactButtonStyle}
            >
              Members
            </button>
          </div>

          {tab === "general" && (
            <form className="aurosModalForm" onSubmit={handleSubmit}>
              <label className="aurosModalField">
                <span>Server Name</span>
                <input
                  className="aurosModalInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Server name"
                />
              </label>

              <label className="aurosModalField">
                <span>Description</span>
                <textarea
                  className="aurosModalTextarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your server"
                  rows={4}
                />
              </label>

              <label className="aurosModalField">
                <span>Server Icon</span>
                <input
                  className="aurosModalInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <div className="aurosModalActions">
                <button type="button" className="aurosModalSecondary" onClick={onClose}>
                  Cancel
                </button>

                <button type="submit" className="aurosModalPrimary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Server"}
                </button>
              </div>
            </form>
          )}

          {tab === "roles" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "420px 1fr",
                gap: 18,
                alignItems: "start",
              }}
            >
              {/* LEFT: CREATE / EDIT */}
              <section
                className="aurosModalForm"
                style={{
                  border: "1px solid rgba(212,175,55,0.16)",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <p className="aurosPanelOverline">
                      {isCreatingRole ? "CREATE ROLE" : "EDIT ROLE"}
                    </p>
                    <h3 style={{ margin: 0 }}>
                      {isCreatingRole ? "New Role" : selectedRole?.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="aurosModalSecondary"
                    onClick={() => startCreateRole()}
                    style={compactButtonStyle}
                  >
                    + New
                  </button>
                </div>

                <label className="aurosModalField">
                  <span>Role Name</span>
                  <input
                    className="aurosModalInput"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Alpha"
                  />
                </label>

                <label className="aurosModalField">
                  <span>Role Icon</span>
                  <input
                    className="aurosModalInput"
                    value={draft.icon}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        icon: e.target.value.slice(0, 3),
                      }))
                    }
                    placeholder="⭐"
                  />
                </label>

                <label className="aurosModalField">
                  <span>Role Color</span>
                  <input
                    className="aurosModalInput"
                    type="color"
                    value={draft.color}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, color: e.target.value }))
                    }
                  />
                </label>

                <label className="aurosModalField">
                  <span>Role Group</span>
                  <input
                    className="aurosModalInput"
                    list="role-groups"
                    value={draft.groupName}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        groupName: e.target.value,
                      }))
                    }
                    placeholder="Management"
                  />

                  <datalist id="role-groups">
                    {roleGroups.map((group) => (
                      <option key={group} value={group} />
                    ))}
                  </datalist>
                </label>

                <div className="aurosModalField">
                  <span>Security</span>

                  <label style={{ display: "flex", gap: 10, color: "#d7e4ff", fontWeight: 800 }}>
                    <input
                      type="checkbox"
                      checked={draft.locked}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          locked: e.target.checked,
                        }))
                      }
                    />
                    Locked Role
                  </label>

                  <label style={{ display: "flex", gap: 10, color: "#d7e4ff", fontWeight: 800 }}>
                    <input
                      type="checkbox"
                      checked={draft.adminOnly}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          adminOnly: e.target.checked,
                        }))
                      }
                    />
                    Only Admins can assign
                  </label>
                </div>

                <div className="aurosModalField">
                  <span>Permissions</span>

                  <div style={{ display: "grid", gap: 8 }}>
                    {permissions.map(([key, label]) => (
                      <label
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: "#d7e4ff",
                          fontWeight: 800,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={draft[key]}
                          onChange={(e) =>
                            updateDraftPermission(key, e.target.checked)
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="aurosModalActions">
                  {!isCreatingRole && (
                    <button
                      type="button"
                      className="aurosModalSecondary"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={rolesSaving}
                    >
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    className="aurosModalPrimary"
                    onClick={handleSaveRole}
                    disabled={rolesSaving || !draft.name.trim()}
                  >
                    {rolesSaving
                      ? "Saving..."
                      : isCreatingRole
                      ? "Create Role"
                      : "Save Role"}
                  </button>
                </div>
              </section>

              {/* RIGHT: ALL ROLES */}
              <section
                className="aurosModalForm"
                style={{
                  border: "1px solid rgba(212,175,55,0.16)",
                  borderRadius: 20,
                  padding: 18,
                  minHeight: 520,
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <p className="aurosPanelOverline">ROLE LIST</p>
                  <h3 style={{ margin: 0 }}>All Roles & Sorting</h3>
                </div>

                {rolesLoading && <p className="aurosProfileBio">Loading roles...</p>}

                {!rolesLoading && roles.length === 0 && (
                  <p className="aurosProfileBio">No roles created yet.</p>
                )}

                <div style={{ display: "grid", gap: 18 }}>
                  {Object.entries(groupedRoles).map(([groupName, groupRoles]) => (
                    <div key={groupName}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <strong
                          style={{
                            fontSize: 12,
                            letterSpacing: 1,
                            color: "#d4af37",
                            textTransform: "uppercase",
                          }}
                        >
                          {groupName}
                        </strong>

                        <button
                          type="button"
                          className="aurosModalSecondary"
                          onClick={() => startCreateRole(groupName)}
                          style={{
                            ...compactButtonStyle,
                            height: 32,
                            minHeight: 32,
                            fontSize: 12,
                          }}
                        >
                          + Role
                        </button>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        {groupRoles
                          .sort((a, b) => a.position - b.position)
                          .map((role) => (
                            <div
                              key={role.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 38px 38px",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <button
                                type="button"
                                className={
                                  role.id === selectedRole?.id
                                    ? "aurosModalPrimary"
                                    : "aurosModalSecondary"
                                }
                                onClick={() => startEditRole(role)}
                                style={{
                                  justifyContent: "flex-start",
                                  minHeight: 40,
                                  height: 40,
                                  padding: "0 12px",
                                  borderColor:
                                    role.id === selectedRole?.id
                                      ? role.color
                                      : "rgba(76,201,240,0.14)",
                                }}
                              >
                                <span style={{ marginRight: 8 }}>
                                  {role.icon ?? "⭐"}
                                </span>

                                <span
                                  style={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: 999,
                                    background: role.color,
                                    marginRight: 8,
                                  }}
                                />

                                {role.name}

                                {role.locked && (
                                  <span style={{ marginLeft: 8, opacity: 0.75 }}>
                                    🔒
                                  </span>
                                )}
                              </button>

                              <button
                                type="button"
                                className="aurosModalSecondary"
                                onClick={() => moveRole(role.id, "up")}
                                disabled={rolesSaving}
                                style={{ height: 40, minHeight: 40, padding: 0 }}
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                className="aurosModalSecondary"
                                onClick={() => moveRole(role.id, "down")}
                                disabled={rolesSaving}
                                style={{ height: 40, minHeight: 40, padding: 0 }}
                              >
                                ↓
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

{tab === "members" && (
  <div className="aurosModalForm">
    <p className="aurosPanelOverline">MEMBERS</p>
    <h3 style={{ marginTop: 0 }}>Member Role Assignment</h3>

    {memberRolesLoading && (
      <p className="aurosProfileBio">Loading member roles...</p>
    )}

    <div style={{ display: "grid", gap: 12 }}>
      {members.length === 0 && (
        <p className="aurosProfileBio">No members found.</p>
      )}

      {members.map((member) => {
        const name = member.displayName || member.username || "User";
        const memberRoles = memberRoleMap[member.id] ?? [];

        return (
          <div
            key={member.id}
            style={{
              display: "grid",
              gridTemplateColumns: "230px 1fr",
              gap: 14,
              alignItems: "start",
              padding: 14,
              borderRadius: 18,
              border: "1px solid rgba(212,175,55,0.14)",
              background: "rgba(31,31,31,0.72)",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="aurosMemberAvatar">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={name} />
                ) : (
                  name.slice(0, 1).toUpperCase()
                )}
              </span>

              <div>
                <strong>{name}</strong>
                <p style={{ margin: "4px 0 0", color: "#998f76", fontSize: 13 }}>
                  @{member.username || "unknown"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {roles.length === 0 && (
                <p className="aurosProfileBio">No roles created yet.</p>
              )}

              {roles.map((role) => {
                const checked = memberRoles.includes(role.id);

                return (
                  <label
                    key={role.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: `1px solid ${role.color}`,
                      background: checked
                        ? "rgba(212,175,55,0.18)"
                        : "rgba(15,15,15,0.72)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMemberRole(member.id, role.id)}
                    />

                    <span>{role.icon ?? "⭐"}</span>
                    <span>{role.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
        </div>
      </div>

      {deleteConfirmOpen && selectedRole && (
        <div
          className="aurosModalOverlay"
          style={{
            zIndex: 10000,
            background: "rgba(0,0,0,0.76)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="aurosModalCard" style={{ maxWidth: 480 }}>
            <div className="aurosModalHeader">
              <div>
                <p className="aurosPanelOverline">DELETE ROLE</p>
                <h3 className="aurosModalTitle">Delete {selectedRole.name}?</h3>
              </div>

              <button
                type="button"
                className="aurosModalClose"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="aurosProfileBio">
              This role will be removed from the server. Members with this role
              will lose its permissions and color.
            </p>

            <div className="aurosModalActions">
              <button
                type="button"
                className="aurosModalSecondary"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={rolesSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="aurosModalPrimary"
                onClick={handleDeleteSelectedRole}
                disabled={rolesSaving}
              >
                {rolesSaving ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}