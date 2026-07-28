import { useMemo, useState,useEffect } from "react";
import {Search,Users,Shield,MoreVertical,Trash2,UserCog,} from "lucide-react";

import { useOrganisation } from "../context/OrganisationContext";
import { useAuth } from "../context/AuthContext";
import { orgApi } from "../api/org.api";

export default function Members() {
  const {
    selectedOrganisation,
    organisations,
    selectOrganisation,
  } = useOrganisation();

  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [openMenu, setOpenMenu] = useState(null);
  const [updatingMember, setUpdatingMember] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);

  const [joinCode, setJoinCode] = useState(
  selectedOrganisation?.joinCode || ""
  );

  const [joinCodeExpiresAt, setJoinCodeExpiresAt] = useState(
    selectedOrganisation?.joinCodeExpiresAt || null
  );

  const [generatingCode, setGeneratingCode] = useState(false);

  const [error, setError] = useState("");



  //current user ki membership check karne ke liye.

  const currentUserMembership = useMemo(() => {
    if (!selectedOrganisation || !user) return null;

    return selectedOrganisation.members?.find(
      (member) =>
        member.user?._id === user._id
    );
  }, [selectedOrganisation, user]);

  console.log("CURRENT USER:", user);

console.log(
  "SELECTED ORGANISATION:",
  selectedOrganisation
);

console.log(
  "MEMBERS:",
  selectedOrganisation?.members
);

console.log(
  "CURRENT USER MEMBERSHIP:",
  currentUserMembership
);

console.log(
  "CAN MANAGE:",
  currentUserMembership?.permissions?.includes(
    "member:updatePermissions"
  )
);

console.log(
  "CAN REMOVE:",
  currentUserMembership?.permissions?.includes(
    "member:remove"
  )
);

  //filtered members will be shown through this function
  const filteredMembers = useMemo(() => {
    if (!selectedOrganisation?.members) return [];

    return selectedOrganisation.members.filter((member) => {
      const name = member.user?.name || "";
      const email = member.user?.email || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [
    selectedOrganisation,
    search,
    roleFilter,
  ]);
//permission to manage members
  const canManageMembers =
    currentUserMembership?.permissions?.includes(
      "member:updatePermissions"
    );
//permission to remove members 
  const canRemoveMembers =
    currentUserMembership?.permissions?.includes(
      "member:remove"
    );
//who can amange join code
  const canManageJoinCode =
  currentUserMembership?.permissions?.includes(
    "org:joinCodeManage"
  );
//handle generate code
  const handleGenerateJoinCode = async () => {
  try {
    setError("");
    setGeneratingCode(true);

    const response = await orgApi.generateJoinCode(
      selectedOrganisation._id
    );

    const {
      joinCode,
      expiresAt,
    } = response.data;

    setJoinCode(joinCode);
    setJoinCodeExpiresAt(expiresAt);

    selectOrganisation({
      ...selectedOrganisation,
      joinCode,
      joinCodeExpiresAt: expiresAt,
    });

  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to generate join code."
    );
  } finally {
    setGeneratingCode(false);
  }
};

  const handleRoleChange = async (member, role) => {
    try {
      setError("");
      setUpdatingMember(member.user._id);

      const response = await orgApi.updateMemberRole(
        selectedOrganisation._id,
        member.user._id,
        role
      );

      const updatedMember = response.data.member;

      const updatedOrganisation = {
        ...selectedOrganisation,
        members: selectedOrganisation.members.map((item) =>
          item.user._id === member.user._id
            ? {
                ...item,
                role: updatedMember.role,
                permissions: updatedMember.permissions,
              }
            : item
        ),
      };

      selectOrganisation(updatedOrganisation);

      setOpenMenu(null);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update member role."
      );
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async (member) => {
    const confirmed = window.confirm(
      `Remove ${member.user?.name} from this organisation?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setRemovingMember(member.user._id);

      await orgApi.removeMember(
        selectedOrganisation._id,
        member.user._id
      );

      const updatedOrganisation = {
        ...selectedOrganisation,
        members: selectedOrganisation.members.filter(
          (item) =>
            item.user._id !== member.user._id
        ),
      };

      selectOrganisation(updatedOrganisation);

      setOpenMenu(null);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove member."
      );
    } finally {
      setRemovingMember(null);
    }
  };
//return if no org is selected.
  if (!selectedOrganisation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">

        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-semibold mb-2">
          No organisation selected
        </h1>

        <p className="text-muted-foreground max-w-md">
          Select an organisation from the organisation selector
          to view its members.
        </p>

      </div>
    );
  }
//return when org is selected
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Members
          </h1>

          <p className="text-muted-foreground mt-2">
            Manage members of{" "}
            <span className="text-foreground font-medium">
              {selectedOrganisation.name}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          {selectedOrganisation.members?.length || 0} members
        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* handle join code  */}

      {canManageJoinCode && (
      <div className="bg-card border border-border rounded-xl p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold">
              Organisation Join Code
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Share this code with people who need to join
              this organisation.
            </p>
          </div>

          <button
            onClick={handleGenerateJoinCode}
            disabled={generatingCode}
            className="
              px-4
              py-2.5
              rounded-lg
              bg-primary
              text-primary-foreground
              font-medium
              hover:opacity-90
              disabled:opacity-50
            "
          >
            {generatingCode
              ? "Generating..."
              : joinCode
              ? "Regenerate Code"
              : "Generate Join Code"}
          </button>

        </div>

        {joinCode && (
          <div className="mt-5 flex flex-col md:flex-row md:items-center gap-4">

            <div className="
              flex-1
              bg-secondary
              border
              border-border
              rounded-lg
              px-4
              py-3
              font-mono
              text-lg
              tracking-wider
            ">
              {joinCode}
            </div>

            {joinCodeExpiresAt && (
              <p className="text-sm text-muted-foreground">
                Expires on{" "}
                {new Date(
                  joinCodeExpiresAt
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    )}

      {/* Filters */}

      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1 max-w-md">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              bg-card
              border
              border-border
              rounded-lg
              pl-10
              pr-4
              py-3
              outline-none
              focus:border-primary
            "
          />

        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          className="
            bg-card
            border
            border-border
            rounded-lg
            px-4
            py-3
            outline-none
          "
        >
          <option value="all">
            All Roles
          </option>

          <option value="owner">
            Owners
          </option>

          <option value="admin">
            Admins
          </option>

          <option value="member">
            Members
          </option>

        </select>

      </div>

      {/* Members */}

      {filteredMembers.length === 0 ? (

        <div className="bg-card border border-border rounded-xl p-10 text-center">

          <Users className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            No members found
          </h2>

          <p className="text-muted-foreground mt-2">
            Try changing your search or filter.
          </p>

        </div>

      ) : (

        <div className="bg-card border border-border rounded-xl overflow-visible">

          {/* Table Header */}

          <div className="
            hidden
            md:grid
            grid-cols-[2fr_1fr_1fr_50px]
            gap-4
            px-6
            py-4
            border-b
            border-border
            text-sm
            text-muted-foreground
          ">

            <span>Member</span>
            <span>Role</span>
            <span>Permissions</span>
            <span></span>

          </div>

          {/* Rows */}

          {filteredMembers.map((member) => {

            const isOwner =
              member.role === "owner";

            const isCurrentUser =
              member.user?._id === user?._id;

            const isUpdating =
              updatingMember === member.user?._id;

            const isRemoving =
              removingMember === member.user?._id;

            return (

              <div
                key={member._id}
                className="
                  relative
                  grid
                  grid-cols-1
                  md:grid-cols-[2fr_1fr_1fr_50px]
                  gap-4
                  items-center
                  px-6
                  py-5
                  border-b
                  border-border
                  last:border-b-0
                "
              >

                {/* Member */}

                <div className="flex items-center gap-4">

                  <div className="
                    w-11
                    h-11
                    rounded-full
                    bg-primary/15
                    text-primary
                    flex
                    items-center
                    justify-center
                    font-semibold
                  ">
                    {member.user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <p className="font-medium">
                        {member.user?.name ||
                          "Unknown User"}
                      </p>

                      {isCurrentUser && (
                        <span className="
                          text-xs
                          px-2
                          py-0.5
                          rounded-full
                          bg-secondary
                          text-muted-foreground
                        ">
                          You
                        </span>
                      )}

                    </div>

                    <p className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </p>

                  </div>

                </div>

                {/* Role */}

                <div>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      px-3
                      py-1.5
                      rounded-full
                      text-sm
                      font-medium
                      ${
                        member.role === "owner"
                          ? "bg-primary/15 text-primary"
                          : member.role === "admin"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-secondary text-muted-foreground"
                      }
                    `}
                  >
                    {member.role === "owner" && (
                      <Shield className="w-3.5 h-3.5" />
                    )}

                    {member.role.charAt(0).toUpperCase() +
                      member.role.slice(1)}

                  </span>

                </div>

                {/* Permissions */}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                  <UserCog className="w-4 h-4" />

                  {member.permissions?.length || 0} permissions

                </div>

                {/* Actions */}

                <div className="relative flex justify-start md:justify-end">

                  {(canManageMembers ||
                    canRemoveMembers) &&
                    !isOwner && (

                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === member.user._id
                            ? null
                            : member.user._id
                        )
                      }
                      className="
                        p-2
                        rounded-lg
                        hover:bg-secondary
                        transition
                      "
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                  )}

                  {openMenu === member.user._id && (

                    <div className="
                      absolute
                      right-0
                      top-10
                      z-50
                      w-48
                      bg-card
                      border
                      border-border
                      rounded-lg
                      shadow-xl
                      p-1
                    ">

                      {canManageMembers && (

                        <>

                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleRoleChange(
                                member,
                                member.role === "admin"
                                  ? "member"
                                  : "admin"
                              )
                            }
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-3
                              py-2
                              rounded-md
                              text-left
                              hover:bg-secondary
                              disabled:opacity-50
                            "
                          >

                            <UserCog className="w-4 h-4" />

                            {isUpdating
                              ? "Updating..."
                              : member.role === "admin"
                              ? "Make Member"
                              : "Make Admin"}

                          </button>

                        </>

                      )}

                      {canRemoveMembers && (

                        <button
                          disabled={isRemoving}
                          onClick={() =>
                            handleRemoveMember(member)
                          }
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-3
                            py-2
                            rounded-md
                            text-left
                            text-red-400
                            hover:bg-red-500/10
                            disabled:opacity-50
                          "
                        >

                          <Trash2 className="w-4 h-4" />

                          {isRemoving
                            ? "Removing..."
                            : "Remove Member"}

                        </button>

                      )}

                    </div>

                  )}

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}