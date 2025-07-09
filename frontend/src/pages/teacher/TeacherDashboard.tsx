import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, Users, TrendingUp, Clock, Calendar, HelpCircle } from "lucide-react";
import { useRoomsByTeacher, Poll } from "@/lib/api/livequizHooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store/auth-store";

export default function TeacherDashboard() {
  const [isDark] = useState(false);

  /**********************
   * Authentication
   **********************/
  const { user } = useAuthStore();
  const teacherId = user?.userId || user?.uid; // fallback to firebase UID if backend userId is absent

  /**********************
   * Data fetching
   **********************/
  const { data: rooms, isLoading } = useRoomsByTeacher(teacherId);

  /**********************
   * Data computations
   **********************/
  const {
    overview,
    liveParticipation,
    recentPolls,
    pollDetails,
    activePolls,
    upcomingPolls,
    pollResults,
  } = useMemo(() => {
    if (!rooms || !Array.isArray(rooms)) {
      // Default placeholders while loading or if no rooms
      return {
        overview: {
          totalPolls: 0,
          totalResponses: 0,
          totalParticipationRate: 0,
        },
        liveParticipation: {
          attended: 0,
          notAttended: 0,
          participationRate: 0,
        },
        recentPolls: [] as { name: string; created: string; attended: number; notAttended: number }[],
        pollDetails: [] as { title: string; type: string; timer: string }[],
        activePolls: [] as { title: string; status: string }[],
        upcomingPolls: [] as { name: string; time: string }[],
        pollResults: [],
      };
    }

    // Aggregate stats
    const allPolls: Poll[] = rooms.flatMap((r) => r.polls || []);

    const totalPolls = allPolls.length;
    const totalResponses = allPolls.reduce((acc, p) => acc + (p.answers?.length || 0), 0);

    // Participation rate: average responses per poll (percentage out of options length?)
    const totalParticipationRate = totalPolls
      ? Math.round((totalResponses / totalPolls) * 100) / 100 // average responses
      : 0;

    // Live participation based on most recent poll (if exists)
    const latestPoll = allPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const liveParticipation = latestPoll
      ? {
          attended: latestPoll.answers?.length || 0,
          notAttended: 0, // Backend does not expose total participants, fallback to 0
          participationRate: latestPoll.answers?.length || 0,
        }
      : { attended: 0, notAttended: 0, participationRate: 0 };

    // Recent polls (last 5)
    const recentPolls = allPolls
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((p) => ({
        name: p.question.substring(0, 30),
        created: new Date(p.createdAt).toLocaleDateString(),
        attended: p.answers?.length || 0,
        notAttended: 0,
      }));

    // Poll details for recent polls (limit 3)
    const pollDetails = recentPolls.slice(0, 3).map((r) => ({
      title: r.name,
      type: "MCQ", // Type not provided by backend
      timer: "--:--", // Timer not provided
    }));

    const activePolls = rooms
      .filter((room) => room.status === "active")
      .map((room) => ({ title: room.name, status: "Ongoing" }));

    const upcomingPolls: { name: string; time: string }[] = []; // No backend scheduling yet

    // Poll results for latest poll (bar chart)
    const pollResults = latestPoll
      ? latestPoll.options.map((opt, idx) => ({
          option: opt,
          votes: latestPoll.answers?.filter((a) => a.answerIndex === idx).length || 0,
        }))
      : [];

    return {
      overview: { totalPolls, totalResponses, totalParticipationRate },
      liveParticipation,
      recentPolls,
      pollDetails,
      activePolls,
      upcomingPolls,
      pollResults,
    };
  }, [rooms]);

  const themeClasses = isDark ? "dark" : "";

  // FAQs can stay static for now
  const faqs = [
    { q: "How do I create a poll?", a: "Click the 'Create Poll' button and fill in the details." },
    { q: "How to use AI to generate polls?", a: "Click 'AI Create Poll' and follow the prompts." },
  ];

  return (
    <div className={`${themeClasses} transition-colors duration-300`}>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {/* Top Row: Welcome Banner and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Banner */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 dark:from-purple-600 dark:via-blue-600 dark:to-cyan-500 text-white relative overflow-hidden shadow-lg dark:shadow-2xl border-0">
            <CardContent className="flex flex-row items-center justify-between p-8 h-64">
              {/* Left: Text (50%) */}
              <div className="w-1/2 flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-2 drop-shadow-sm">
                  Welcome Back!
                  <br />
                  <span className="capitalize">
                    {user?.salutation ? `${user.salutation} ` : ""}
                    {user?.name || "Teacher"}
                  </span>
                </h2>
                <p className="mb-4 text-lg font-semibold opacity-90 drop-shadow-sm">
                  Empower, Engage, Evaluate—Live!
                </p>
                <div className="flex gap-3">
                  <a href="/teacher/pollroom" className="no-underline">
                    <Button
                      className="bg-white/95 hover:bg-white text-purple-600 font-bold shadow-md w-fit transition-all duration-200 hover:scale-105"
                    >
                      + Create Poll Room
                    </Button>
                  </a>
                </div>
              </div>
              {/* Right: Image placeholder */}
              <div className="w-1/2 flex items-center justify-center">
                <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                  {/* Add your image here */}
                  <img
                    src="/teacher-illustration.png"
                    alt="Welcome Teacher"
                    className="w-40 h-40 object-cover rounded-full shadow-lg"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Optionally, keep the icon as a fallback */}
                  {/* <BarChart3 className="w-24 h-24 text-white/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Summary */}
          <Card className="flex flex-col justify-between p-6 shadow-lg dark:shadow-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total Polls</span>
                </div>
                <span className="text-purple-500 dark:text-purple-400 font-bold text-lg">{overview.totalPolls}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total Responses</span>
                </div>
                <span className="text-blue-500 dark:text-blue-400 font-bold text-lg">{overview.totalResponses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Participation Rate</span>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold text-lg">{overview.totalParticipationRate}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Row: My Polls, Poll Details, Active Polls, Upcoming Polls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* My Polls */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                My Polls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPolls.map((poll, idx) => (
                <div key={poll.name} className="p-3 rounded-lg bg-blue-50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="font-semibold text-lg text-blue-800 dark:text-blue-300">{poll.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Created: {poll.created}</div>
                  <div className="flex gap-4 mt-2">
                    <div className="text-xs text-green-600 dark:text-green-400">✓ {poll.attended}</div>
                    <div className="text-xs text-red-500 dark:text-red-400">✗ {poll.notAttended}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Poll Details */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Poll Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pollDetails.map((poll, idx) => (
                <div key={poll.title} className="p-3 rounded-lg bg-purple-50 dark:bg-slate-700/50 border border-purple-100 dark:border-slate-600 hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="font-semibold text-lg text-purple-800 dark:text-purple-300">{poll.title}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">
                    Type: <span className="font-semibold text-purple-600 dark:text-purple-400">{poll.type}</span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Timer: <span className="font-semibold">{poll.timer}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Polls */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                Active Polls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePolls.map((poll, idx) => (
                <div key={poll.title} className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-slate-700/50 border border-cyan-100 dark:border-slate-600">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  <div>
                    <div className="font-semibold text-cyan-800 dark:text-cyan-300">{poll.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{poll.status}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Polls */}
          <Card className="lg:col-span-1 shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Polls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingPolls.map((poll, idx) => (
                <div key={poll.name} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-slate-700/50 border border-amber-100 dark:border-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <div>
                    <div className="font-semibold text-amber-800 dark:text-amber-300">{poll.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{poll.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Participation Rate and Poll Results (Live) */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Participation & Results (Live)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 py-4">
              {/* Participation Rate (Live) */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Participation Rate (Live)</span>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Attended", value: liveParticipation.attended },
                        { name: "Not Attended", value: liveParticipation.notAttended },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      <Cell fill={isDark ? "#22c55e" : "#34d399"} />
                      <Cell fill={isDark ? "#ef4444" : "#f87171"} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Attended</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{liveParticipation.attended}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Not Attended</span>
                    <span className="text-lg font-bold text-red-500 dark:text-red-400">{liveParticipation.notAttended}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Rate</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{liveParticipation.participationRate}%</span>
                  </div>
                </div>
              </div>

              {/* Poll Results */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Poll Results</span>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pollResults} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="option" 
                      tick={{ fontSize: 14, fill: isDark ? '#9ca3af' : '#6b7280' }} 
                      axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} 
                      axisLine={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isDark ? '#f3f4f6' : '#1f2937'
                      }}
                    />
                    <Bar 
                      dataKey="votes" 
                      fill={isDark ? "#3b82f6" : "#6366f1"} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-700 dark:text-gray-300">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-gray-600 dark:text-gray-400">
                Your polls are performing well with an overall participation rate of {overview.totalParticipationRate}%. 
                Keep engaging your students with interactive content to maintain high participation levels.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="shadow-md dark:shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="font-semibold text-purple-700 dark:text-purple-400 mb-2">{faq.q}</div>
                  <div className="text-gray-600 dark:text-gray-400">{faq.a}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}