import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuizResults } from "../services/quizServices";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";
import {
    ArrowLeft,
    Trophy,
    CheckCircle2,
    XCircle,
    BarChart3,
    RotateCcw,
} from "lucide-react";

export default function QuizResultPage() {
    const { id } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await getQuizResults(id);
                setResults(res.data || res);
            } catch (err) {
                setError(err.message || "Failed to load results");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-3xl mx-auto">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const quiz = results?.quiz || results;
    const score = results?.score ?? quiz?.score ?? 0;
    const questions = quiz?.questions || results?.questions || [];
    const totalQuestions = questions.length;
    const correctCount = results?.correctAnswers ??
        questions.filter((q) => q.isCorrect || q.correct).length;

    const scoreColor =
        score >= 80
            ? "from-emerald-500 to-green-500"
            : score >= 60
            ? "from-amber-500 to-yellow-500"
            : "from-red-500 to-orange-500";

    const scoreMessage =
        score >= 90
            ? "Outstanding! 🎉"
            : score >= 80
            ? "Great job! 🌟"
            : score >= 70
            ? "Good work! 👍"
            : score >= 60
            ? "Not bad! Keep studying 📖"
            : "Keep practicing! 💪";

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold text-white">
                    {quiz?.title || "Quiz Results"}
                </h1>
            </div>

            {/* Score Card */}
            <Card className="overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${scoreColor}`} />
                <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br mb-4 shadow-lg">
                            <Trophy className={`h-10 w-10 ${
                                score >= 80 ? "text-amber-400" : score >= 60 ? "text-amber-500" : "text-slate-400"
                            }`} />
                        </div>
                        <p className="text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-1"
                           style={{
                               backgroundImage: score >= 80
                                   ? "linear-gradient(to right, #10b981, #22c55e)"
                                   : score >= 60
                                   ? "linear-gradient(to right, #f59e0b, #eab308)"
                                   : "linear-gradient(to right, #ef4444, #f97316)"
                           }}>
                            {Math.round(score)}%
                        </p>
                        <p className="text-lg text-slate-300 mb-1">{scoreMessage}</p>
                        <p className="text-sm text-slate-500">
                            {correctCount} out of {totalQuestions} correct
                        </p>
                        <Progress value={score} className="mt-4 max-w-xs" />
                    </div>
                </CardContent>
            </Card>

            {/* Questions Review */}
            {questions.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-400" />
                        Question Review
                    </h2>
                    {questions.map((q, index) => {
                        const isCorrect = q.isCorrect || q.correct;
                        const options = q.options || q.choices || [];
                        const userAnswer = q.userAnswer ?? q.selectedAnswer;
                        const correctAnswer = q.correctAnswer;
                        return (
                            <Card
                                key={index}
                                className={`border-l-4 ${
                                    isCorrect ? "border-l-emerald-500" : "border-l-red-500"
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {isCorrect ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white mb-2">
                                                {index + 1}. {q.question || q.text}
                                            </p>
                                            {options.length > 0 && (
                                                <div className="space-y-1.5">
                                                    {options.map((opt, oi) => {
                                                        const optText = typeof opt === "string" ? opt : opt.text || opt.label;
                                                        const isUserPick = userAnswer === oi;
                                                        const isCorrectOption = correctAnswer === oi;
                                                        return (
                                                            <div
                                                                key={oi}
                                                                className={`text-xs px-3 py-1.5 rounded flex items-center gap-2 ${
                                                                    isCorrectOption
                                                                        ? "bg-emerald-900/20 text-emerald-400 border border-emerald-800/40"
                                                                        : isUserPick && !isCorrect
                                                                        ? "bg-red-900/20 text-red-400 border border-red-800/40"
                                                                        : "text-slate-400"
                                                                }`}
                                                            >
                                                                <span className="font-medium">
                                                                    {String.fromCharCode(65 + oi)}.
                                                                </span>
                                                                {optText}
                                                                {isCorrectOption && (
                                                                    <CheckCircle2 className="h-3 w-3 ml-auto" />
                                                                )}
                                                                {isUserPick && !isCorrect && (
                                                                    <XCircle className="h-3 w-3 ml-auto" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {q.explanation && (
                                                <p className="text-xs text-slate-500 mt-2 italic">
                                                    {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pb-8">
                <Link to={`/quiz/${id}`}>
                    <Button variant="outline">
                        <RotateCcw className="h-4 w-4" />
                        Retake Quiz
                    </Button>
                </Link>
                <Link to="/dashboard">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
