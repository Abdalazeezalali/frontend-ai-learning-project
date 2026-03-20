import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getQuizById, submitQuiz } from "../services/quizServices";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Loader2,
    Clock,
    Send,
    AlertCircle,
} from "lucide-react";

export default function QuizTakePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await getQuizById(id);
                const data = res.data || res;
                setQuiz(data);
                // If already completed, redirect to results
                if (data.completed) {
                    navigate(`/quiz/${id}/results`, { replace: true });
                }
            } catch (err) {
                setError(err.message || "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, navigate]);

    const questions = quiz?.questions || [];
    const question = questions[currentQuestion];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === totalQuestions;

    const handleSelect = (optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion]: optionIndex,
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const formattedAnswers = Object.entries(answers).map(
                ([questionIndex, selectedAnswer]) => ({
                    questionIndex: parseInt(questionIndex),
                    selectedAnswer,
                })
            );
            await submitQuiz(id, formattedAnswers);
            navigate(`/quiz/${id}/results`);
        } catch (err) {
            setError(err.message || "Failed to submit quiz");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-3xl mx-auto">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    if (error && !quiz) {
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

    if (!question) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-slate-400 mb-2">No questions found in this quiz</p>
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

    const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;
    const options = question.options || question.choices || [];

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="text-slate-400 hover:text-white cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {quiz?.title || "Quiz"}
                        </h1>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Question {currentQuestion + 1} of {totalQuestions}
                        </p>
                    </div>
                </div>
                <Badge variant="secondary">
                    {answeredCount}/{totalQuestions} answered
                </Badge>
            </div>

            {/* Progress */}
            <Progress value={progressPercent} />

            {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg leading-relaxed">
                        {question.question || question.text}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {options.map((option, index) => {
                        const isSelected = answers[currentQuestion] === index;
                        const optionText = typeof option === "string" ? option : option.text || option.label;
                        return (
                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                                    isSelected
                                        ? "border-indigo-500 bg-indigo-600/10 text-white ring-1 ring-indigo-500"
                                        : "border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium flex-shrink-0 ${
                                            isSelected
                                                ? "border-indigo-500 bg-indigo-600 text-white"
                                                : "border-slate-600 text-slate-400"
                                        }`}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-sm">{optionText}</span>
                                </div>
                            </button>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => {
                        setCurrentQuestion((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentQuestion === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    {/* Question dots */}
                    <div className="hidden sm:flex items-center gap-1">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                                    i === currentQuestion
                                        ? "bg-indigo-500 scale-125"
                                        : answers[i] !== undefined
                                        ? "bg-indigo-400/50"
                                        : "bg-slate-700"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {currentQuestion < totalQuestions - 1 ? (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setCurrentQuestion((prev) =>
                                Math.min(totalQuestions - 1, prev + 1)
                            );
                        }}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        className={!allAnswered ? "opacity-50" : ""}
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Submit Quiz
                            </>
                        )}
                    </Button>
                )}
            </div>

            {!allAnswered && currentQuestion === totalQuestions - 1 && (
                <p className="text-center text-xs text-slate-500">
                    Answer all questions to submit the quiz
                </p>
            )}
        </div>
    );
}
