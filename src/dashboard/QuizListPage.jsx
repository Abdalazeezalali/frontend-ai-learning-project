import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuizzesForDocument, deleteQuiz } from "../services/quizServices";
import { getDocumentById } from "../services/documentServices";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import {
    GraduationCap,
    ArrowLeft,
    ArrowRight,
    Play,
    BarChart3,
    Trash2,
    Clock,
    Loader2,
    FileText,
} from "lucide-react";

export default function QuizListPage() {
    const { documentId } = useParams();
    const [quizzes, setQuizzes] = useState([]);
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizRes, docRes] = await Promise.all([
                    getQuizzesForDocument(documentId),
                    getDocumentById(documentId).catch(() => null),
                ]);
                setDocument(docRes);
                const data = quizRes.data || quizRes;
                setQuizzes(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Failed to load quizzes");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [documentId]);

    const handleDelete = async (quizId) => {
        setDeleting(quizId);
        try {
            await deleteQuiz(quizId);
            setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
        } catch (err) {
            setError(err.message || "Failed to delete quiz");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to={`/documents/${documentId}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Quizzes
                    </h1>
                    <p className="text-sm text-slate-400">
                        {document?.title || "Document"} • {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {quizzes.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16">
                    <GraduationCap className="h-16 w-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No quizzes yet</h3>
                    <p className="text-sm text-slate-400 mb-4">Generate a quiz from the document detail page</p>
                    <Link to={`/documents/${documentId}`}>
                        <Button variant="secondary">
                            <FileText className="h-4 w-4" />
                            Go to Document
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <Card
                            key={quiz._id}
                            className="group hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-400">
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base truncate max-w-[180px]">
                                                {quiz.title || "Untitled Quiz"}
                                            </CardTitle>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {new Date(quiz.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {quiz.score != null && (
                                        <Badge
                                            variant={
                                                quiz.score >= 80
                                                    ? "success"
                                                    : quiz.score >= 60
                                                    ? "warning"
                                                    : "destructive"
                                            }
                                        >
                                            {Math.round(quiz.score)}%
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
                                    <span>{quiz.questions?.length || quiz.numQuestions || 0} questions</span>
                                    {quiz.completed && (
                                        <Badge variant="success" className="text-xs">Completed</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link to={quiz.completed ? `/quiz/${quiz._id}/results` : `/quiz/${quiz._id}`} className="flex-1">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                        >
                                            {quiz.completed ? (
                                                <>
                                                    <BarChart3 className="h-3.5 w-3.5" />
                                                    Results
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-3.5 w-3.5" />
                                                    Take Quiz
                                                </>
                                            )}
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8"
                                        onClick={() => handleDelete(quiz._id)}
                                        disabled={deleting === quiz._id}
                                    >
                                        {deleting === quiz._id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
