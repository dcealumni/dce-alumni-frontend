import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaUserPlus,
  FaCalendarAlt,
  FaBullhorn,
} from "react-icons/fa";
import axios from "axios";

const DashboardHome = () => {
  // State for dynamic stats
  const [stats, setStats] = useState({
    totalAlumni: 0,
    pendingRequests: 0,
    upcomingEvents: 2,
    announcements: 3,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch approved alumni count
      const approvedResponse = await axios.get(
        "https://dce-server.vercel.app/alumni-registration/approved"
      );
      const totalAlumni = approvedResponse.data.alumni?.length || 0;

      // Fetch pending alumni count
      const pendingResponse = await axios.get(
        "https://dce-server.vercel.app/alumni-registration/pending"
      );
      const pendingRequests = pendingResponse.data.alumni?.length || 0;

      setStats((prev) => ({
        ...prev,
        totalAlumni,
        pendingRequests,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activities = [];

      // Fetch recent approved alumni (last 5)
      const approvedResponse = await axios.get(
        "https://dce-server.vercel.app/alumni-registration/approved"
      );
      const approvedAlumni = approvedResponse.data.alumni || [];

      // Add recent approvals to activities
      approvedAlumni
        .sort(
          (a, b) =>
            new Date(
              b.approvedAt || b.updatedAt || b.createdAt
            ) -
            new Date(
              a.approvedAt || a.updatedAt || a.createdAt
            )
        )
        .slice(0, 3)
        .forEach((alumni) => {
          activities.push({
            id: `approved-${alumni._id}`,
            type: "approval",
            title: "Alumni Approved",
            description: `${alumni.name} was approved as alumni`,
            time: formatTimeAgo(
              alumni.approvedAt || alumni.updatedAt || alumni.createdAt
            ),
            date: new Date(
              alumni.approvedAt || alumni.updatedAt || alumni.createdAt
            ),
          });
        });

      // Fetch recent pending registrations (last 3)
      const pendingResponse = await axios.get(
        "https://dce-server.vercel.app/alumni-registration/pending"
      );
      const pendingAlumni = pendingResponse.data.alumni || [];

      // Add recent registrations to activities
      pendingAlumni
        .sort(
          (a, b) =>
            new Date(b.registrationDate || b.createdAt) -
            new Date(a.registrationDate || a.createdAt)
        )
        .slice(0, 2)
        .forEach((alumni) => {
          activities.push({
            id: `registration-${alumni._id}`,
            type: "registration",
            title: "New Alumni Registration",
            description: `${alumni.name} submitted registration request`,
            time: formatTimeAgo(
              alumni.registrationDate || alumni.createdAt
            ),
            date: new Date(
              alumni.registrationDate || alumni.createdAt
            ),
          });
        });

      // Sort all activities by date (most recent first) and limit to 5
      const sortedActivities = activities
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Fallback to static data if API fails
      setRecentActivities([
        {
          id: 1,
          type: "registration",
          title: "New Alumni Registration",
          description: "Recent registration request",
          time: "Recently",
        },
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Simple Welcome */}
      <h1 className="text-2xl font-medium text-gray-800">Dashboard Overview</h1>

      {/* Stats Overview - Simplified */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="flex items-center">
            <FaUserGraduate className="text-blue-500 mr-3 text-xl" />
            <div>
              <div className="text-2xl font-medium">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalAlumni
                )}
              </div>
              <div className="text-xs text-gray-500">Total Alumni</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <div className="flex items-center">
            <FaUserPlus className="text-amber-500 mr-3 text-xl" />
            <div>
              <div className="text-2xl font-medium">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.pendingRequests
                )}
              </div>
              <div className="text-xs text-gray-500">Pending Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <div className="flex items-center">
            <FaCalendarAlt className="text-green-500 mr-3 text-xl" />
            <div>
              <div className="text-2xl font-medium">{stats.upcomingEvents}</div>
              <div className="text-xs text-gray-500">Upcoming Events</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <div className="flex items-center">
            <FaBullhorn className="text-purple-500 mr-3 text-xl" />
            <div>
              <div className="text-2xl font-medium">{stats.announcements}</div>
              <div className="text-xs text-gray-500">Announcements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout for activity and actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity - Dynamic */}
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
          <div className="space-y-3">
            {activitiesLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="flex animate-pulse">
                  <div className="mr-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex">
                  <div className="mr-3">
                    <div
                      className={`w-2 h-2 mt-2 rounded-full ${
                        activity.type === "registration"
                          ? "bg-blue-500"
                          : activity.type === "approval"
                          ? "bg-green-500"
                          : activity.type === "event"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-600 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Simplified */}
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded hover:bg-blue-100 text-left">
              Review Alumni Requests
            </button>
            <button className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded hover:bg-gray-100 text-left">
              Add New Alumni
            </button>
            <button className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded hover:bg-gray-100 text-left">
              Create Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
