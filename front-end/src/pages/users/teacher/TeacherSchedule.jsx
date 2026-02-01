import { useState, useEffect } from "react";
import axiosClient from "../../../services/api/axiosClient";
import { Loader2 } from "lucide-react";

const TeacherSchedule = () => {
  const [groupedSchedule, setGroupedSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axiosClient.get("/teacher/my-schedule");
        setGroupedSchedule(response.data.data);
      } catch (error) {
        console.error("Error fetching schedule", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 flex justify-center items-center h-[500px] font-general-sans">
        <Loader2 className="animate-spin text-main-blue" size={32} />
      </div>
    );
  }

  return (
    <section className="p-6 font-general-sans">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-semibold dark:text-white">My Weekly Schedule</h1>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Object.entries(groupedSchedule).map(([day, classes]) => (
          <div key={day} className="flex flex-col border border-box-outline">
            <div className="bg-slate-100 dark:bg-dark-box p-2 text-center font-bold">
              {day}
            </div>

            {classes.length > 0 ? (
              classes.map((cls) => (
                <div key={cls.id} className="bg-white dark:bg-dark-hover p-3">
                  <p className="text-[13px] font-semibold text-primary-text leading-tight dark:text-white">{cls.course}</p>
                  <p className="text-[14px] text-sub-text mt-1.5 font-medium dark:text-white">{cls.time}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-sub-text font-medium dark:text-white">
                      Room {cls.room}
                    </span>
                    <span className="text-[10px] text-sub-text font-medium dark:text-white">
                      {cls.shift}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-[11px] text-gray-400 dark:text-white">No classes</p>
              </div>
            )}
          </div>
        ))}
      </section>
    </section>
  );
};

export default TeacherSchedule;