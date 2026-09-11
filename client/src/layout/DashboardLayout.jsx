import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import { useAuth } from "../context/AuthContext";
import { useOrganisation } from "../context/OrganisationContext";
import {
  connectSocket,
  leaveOrganisationSocket,
  socket,
} from "../api/socket";
import { queryKeys } from "../api/queryKeys";

export default function DashboardLayout() {
  const queryClient = useQueryClient();

  const { user, loading: authLoading } = useAuth();
  const { selectedOrganisation } = useOrganisation();

  /*
   * ---------------------------------------------------------
   * SOCKET CONNECTION LIFECYCLE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (authLoading) return;

    const token = localStorage.getItem("token");

    if (!user || !token) {
      if (socket.connected) {
        socket.disconnect();
      }

      return;
    }

    const orgId = selectedOrganisation?._id;

    connectSocket(token, orgId);

    return () => {
      if (orgId) {
        leaveOrganisationSocket(orgId);
      }
    };
  }, [authLoading, user, selectedOrganisation?._id]);

  /*
   * ---------------------------------------------------------
   * REAL-TIME TASK EVENTS
   * ---------------------------------------------------------
   *
   * Socket.IO receives the event.
   * We then update the existing TanStack Query cache.
   *
   * TasksTab is already reading this same cache:
   *
   * ["project-tasks", organisationId, projectId]
   *
   * Therefore TasksTab re-renders automatically.
   *
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!user || !selectedOrganisation?._id) {
      return undefined;
    }

    const currentUserId = user?._id || user?.id;
    const currentOrgId = selectedOrganisation._id;

    /*
     * ONE handler for all task events.
     *
     * IMPORTANT:
     * We register THIS function directly with socket.on().
     * The previous code only registered console.log functions,
     * so this cache-update logic was never executed.
     */
    const handleTaskEvent = ({
      event,
      organisationId,
      projectId,
      task,
    }) => {
      console.log("\n🔥 ===============================");
      console.log(`🔥 ${event} RECEIVED`);
      console.log("🔥 ===============================");

      console.log("📦 Payload:", {
        event,
        organisationId,
        projectId,
        task,
      });

      console.log("🆔 Task ID:", task?._id);
      console.log("🏢 Event Organisation:", organisationId);
      console.log("📁 Event Project:", projectId);
      console.log("🏢 Current Organisation:", currentOrgId);

      /*
       * Ignore events from another organisation.
       */
      if (organisationId !== currentOrgId) {
        console.log("⚠️ Ignoring event: different organisation");
        return;
      }

      /*
       * Ignore malformed events.
       */
      if (!task) {
        console.log("⚠️ Ignoring event: no task in payload");
        return;
      }

      /*
       * This MUST match the query key used inside TasksTab:
       *
       * queryKeys.tasks(orgId, projectId)
       *
       * which produces:
       *
       * ["project-tasks", orgId, projectId]
       */
      const taskKey = queryKeys.tasks(
        organisationId,
        projectId
      );

      const myTasksKey = queryKeys.myTasks(
        currentUserId
      );

      console.log("🔑 Task Query Key:", taskKey);
      console.log("🔑 My Tasks Query Key:", myTasksKey);

      /*
       * -------------------------------------------------------
       * CREATE / UPDATE
       * -------------------------------------------------------
       */
      if (
        event === "TASK_CREATED" ||
        event === "TASK_UPDATED"
      ) {
        /*
         * Update the project task cache.
         */
        queryClient.setQueryData(
          taskKey,
          (currentTasks = []) => {
            const nextTasks = [...currentTasks];

            const taskIndex = nextTasks.findIndex(
              (item) => item._id === task._id
            );

            if (taskIndex >= 0) {
              /*
               * Task already exists.
               * Merge the new server data into it.
               */
              nextTasks[taskIndex] = {
                ...nextTasks[taskIndex],
                ...task,
              };

              console.log(
                "✏️ Updated task in TanStack Query cache:",
                task._id
              );
            } else {
              /*
               * New task.
               */
              nextTasks.push(task);

              console.log(
                "➕ Added task to TanStack Query cache:",
                task._id
              );
            }

            return nextTasks;
          }
        );

        /*
         * Update "My Tasks" cache as well.
         */
        queryClient.setQueryData(
          myTasksKey,
          (currentTasks = []) => {
            const nextTasks = [...currentTasks];

            const taskIndex = nextTasks.findIndex(
              (item) => item._id === task._id
            );

            if (taskIndex >= 0) {
              nextTasks[taskIndex] = {
                ...nextTasks[taskIndex],
                ...task,
              };
            } else if (
              task.assignedTo?._id === currentUserId ||
              task.createdBy?._id === currentUserId
            ) {
              nextTasks.push(task);
            }

            return nextTasks;
          }
        );

        console.log(
          "✅ TanStack Query cache updated for:",
          event
        );
      }

      /*
       * -------------------------------------------------------
       * DELETE
       * -------------------------------------------------------
       */
      if (event === "TASK_DELETED") {
        queryClient.setQueryData(
          taskKey,
          (currentTasks = []) => {
            const nextTasks = currentTasks.filter(
              (item) => item._id !== task._id
            );

            console.log(
              "🗑️ Removed task from TanStack Query cache:",
              task._id
            );

            return nextTasks;
          }
        );

        queryClient.setQueryData(
          myTasksKey,
          (currentTasks = []) =>
            currentTasks.filter(
              (item) => item._id !== task._id
            )
        );

        console.log(
          "✅ Task deleted from TanStack Query cache"
        );
      }

      /*
       * -------------------------------------------------------
       * ACTIVITY
       * -------------------------------------------------------
       *
       * Activity is not manually patched.
       * We simply mark it stale so TanStack Query can refetch it.
       */
      queryClient.invalidateQueries({
        queryKey: queryKeys.activity(
          organisationId
        ),
      });
    };

    /*
     * ---------------------------------------------------------
     * REGISTER THE ACTUAL HANDLER
     * ---------------------------------------------------------
     *
     * THIS IS THE IMPORTANT FIX.
     *
     * Previously you had:
     *
     * socket.on("TASK_CREATED", (payload) => {
     *   console.log(...)
     * });
     *
     * That only logged the event.
     *
     * Now the actual cache-update function is registered.
     */
    socket.on(
      "TASK_CREATED",
      handleTaskEvent
    );

    socket.on(
      "TASK_UPDATED",
      handleTaskEvent
    );

    socket.on(
      "TASK_DELETED",
      handleTaskEvent
    );

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */
    return () => {
      socket.off(
        "TASK_CREATED",
        handleTaskEvent
      );

      socket.off(
        "TASK_UPDATED",
        handleTaskEvent
      );

      socket.off(
        "TASK_DELETED",
        handleTaskEvent
      );
    };
  }, [
    queryClient,
    selectedOrganisation?._id,
    user,
  ]);

  useEffect(() => {
    if (!user || !selectedOrganisation?._id) return undefined;

    const organisationId = selectedOrganisation._id;
    const currentUserId = user?._id || user?.id;

    const handleProjectEvent = ({ organisationId: eventOrganisationId, project }) => {
      if (eventOrganisationId !== organisationId || !project?._id) return;

      queryClient.setQueryData(queryKeys.project(organisationId, project._id), {
        project,
        phases: project.phases || [],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects(organisationId),
      });
    };

    const handleOrganisationEvent = ({ organisationId: eventOrganisationId, organisation }) => {
      if (eventOrganisationId !== organisationId || !organisation) return;

      queryClient.setQueryData(
        queryKeys.organisation(organisationId),
        (current) => ({ ...current, ...organisation })
      );
      queryClient.setQueryData(
        queryKeys.organisations(currentUserId),
        (organisations = []) =>
          organisations.map((item) =>
            item._id === organisationId ? { ...item, ...organisation } : item
          )
      );
    };

    socket.on("PROJECT_CREATED", handleProjectEvent);
    socket.on("PROJECT_UPDATED", handleProjectEvent);
    socket.on("ORGANISATION_UPDATED", handleOrganisationEvent);

    return () => {
      socket.off("PROJECT_CREATED", handleProjectEvent);
      socket.off("PROJECT_UPDATED", handleProjectEvent);
      socket.off("ORGANISATION_UPDATED", handleOrganisationEvent);
    };
  }, [queryClient, selectedOrganisation?._id, user]);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */
  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}