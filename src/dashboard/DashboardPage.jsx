import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../services/progressService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";
import {
    FileText,
    Brain,
    GraduationCap,
    Star,
    Trophy,
    Flame,
    TrendingUp,
    CheckCircle2,
    Clock,
    BarChart3,
} from "lucide-react";

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getDashboard();
                setData(res.data || res);
            } catch (err) {
                setError(err.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const overview = data?.overview || {};
    const recentQuizzes = data?.recentQuizzes || [];

    const stats = [
        {
            title: "Documents",
            value: overview.totalDocuments || 0,
            icon: FileText,
            color: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
        },
        {
            title: "Flashcards",
            value: overview.totalFlashcards || 0,
            subtitle: `${overview.reviewedFlashcards || 0} reviewed`,
            icon: Brain,
            color: "from-purple-500 to-pink-500",
            shadow: "shadow-purple-500/20",
        },
        {
            title: "Quizzes",
            value: overview.totalQuizzes || 0,
            subtitle: `${overview.completedQuizzes || 0} completed`,
            icon: GraduationCap,
            color: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20",
        },
        {
            title: "Starred Cards",
            value: overview.starredFlashcards || 0,
            icon: Star,
            color: "from-yellow-500 to-amber-500",
            shadow: "shadow-yellow-500/20",
        },
    ];

    const avgScore = overview.averageScore || 0;
    const streak = overview.studyStreak || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">
                    Your learning progress at a glance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.title}
                        className="group hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">{stat.title}</p>
                                    <p className="text-3xl font-bold text-white mt-1">
                                        {stat.value}
                                    </p>
                                    {stat.subtitle && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {stat.subtitle}
                                        </p>
                                    )}
                                </div>
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Score & Streak */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Average Score */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            Average Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center py-4">
                            <div className="relative h-32 w-32">
                                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="none"
                                        className="text-slate-700/50"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeDasharray={`${(avgScore / 100) * 314} 314`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient
                                            id="scoreGradient"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="0%"
                                        >
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">
                                        {Math.round(avgScore)}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mt-3">
                                {avgScore >= 80
                                    ? "Excellent!"
                                    : avgScore >= 60
                                    ? "Good progress!"
                                    : "Keep learning!"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Study Streak & Quick Stats */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-400" />
                            Study Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center py-4">
                            <div className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                {streak}
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                {streak === 1 ? "day" : "days"} in a row
                            </p>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    Flashcard Sets
                                </span>
                                <span className="text-white font-medium">
                                    {overview.totalFlashcardSets || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Review Progress
                                </span>
                                <span className="text-white font-medium">
                                    {overview.totalFlashcards
                                        ? Math.round(
                                              ((overview.reviewedFlashcards || 0) /
                                                  overview.totalFlashcards) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                            <Progress
                                value={
                                    overview.totalFlashcards
                                        ? ((overview.reviewedFlashcards || 0) /
                                              overview.totalFlashcards) *
                                          100
                                        : 0
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Quizzes */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-400" />
                            Recent Quizzes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentQuizzes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <GraduationCap className="h-10 w-10 text-slate-600 mb-2" />
                                <p className="text-sm text-slate-400">No quizzes taken yet</p>
                                <Link
                                    to="/documents"
                                    className="text-indigo-400 text-sm hover:text-indigo-300 mt-1"
                                >
                                    Upload a document to start
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                {recentQuizzes.slice(0, 5).map((quiz) => (
                                    <Link
                                        key={quiz._id}
                                        to={`/quiz/${quiz._id}/results`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                                                {quiz.title || "Untitled Quiz"}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {new Date(
                                                    quiz.completedAt || quiz.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                quiz.score >= 80
                                                    ? "success"
                                                    : quiz.score >= 60
                                                    ? "warning"
                                                    : "destructive"
                                            }
                                        >
                                            {quiz.score != null
                                                ? `${Math.round(quiz.score)}%`
                                                : (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Done
                                                    </span>
                                                )}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}