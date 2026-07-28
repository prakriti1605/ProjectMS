import { useEffect, useState } from "react";
import { Building2, CheckCircle } from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import { orgApi } from "../api/org.api";
import { taskApi } from "../api/task.api";


export default function Dashboard() {

  const [orgCount, setOrgCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);


  useEffect(() => {

    fetchDashboardData();

  }, []);



  const fetchDashboardData = async () => {

    try {

      const [orgRes, taskRes] = await Promise.all([
        orgApi.getAll(),
        taskApi.getMyTasks(),
      ]);


      setOrgCount(
        orgRes.data.organisations.length
      );


      setTaskCount(
        taskRes.data.tasks.length
      );


    } catch(error){

      console.log(
        "Dashboard error:",
        error
      );

    }

  };


  return (
    <div>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground mt-2">
          Overview of your workspace
        </p>

      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        <StatCard
          title="Organisations"
          value={orgCount}
          icon={Building2}
        />


        <StatCard
          title="My Tasks"
          value={taskCount}
          icon={CheckCircle}
        />


      </div>


    </div>
  );
}