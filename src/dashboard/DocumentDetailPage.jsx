import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDocumentById, deleteDocument } from "../services/documentServices";
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chatWithDocument,
    explainConcept,
    getChatHistory,
} from "../services/aiService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Label } from "../components/ui/Label";
import { Skeleton } from "../components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/Dialog";
import LoadingSpinner from "../components/LoadingSpinner";
import {
    FileText,
    Brain,
    GraduationCap,
    Sparkles,
    MessageSquare,
    Lightbulb,
    BookOpen,
    Loader2,
    ArrowLeft,
    Trash2,
    Send,
    Bot,
    User,
    Clock,
    Copy,
    Check,
} from "lucide-react";

const statusMap = {
    processing: { variant: "warning", label: "Processing" },
    ready: { variant: "success", label: "Ready" },
    failed: { variant: "destructive", label: "Failed" },
};

export default function DocumentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // AI action states
    const [flashcardCount, setFlashcardCount] = useState(10);
    const [quizCount, setQuizCount] = useState(10);
    const [quizTitle, setQuizTitle] = useState("");
    const [generating, setGenerating] = useState({});
    const [genResult, setGenResult] = useState({});

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Concept state
    const [conceptOpen, setConceptOpen] = useState(false);
    const [concept, setConcept] = useState("");
    const [conceptResult, setConceptResult] = useState("");
    const [conceptLoading, setConceptLoading] = useState(false);

    // Summary state
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summaryResult, setSummaryResult] = useState("");
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Copy state
    const [copied, setCopied] = useState(false);

    const isReady = document?.status === "ready";

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const data = await getDocumentById(id);
                setDocument(data);
            } catch (err) {
                setError(err.message || "Failed to load document");
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);

    // Load chat history
    useEffect(() => {
        if (isReady) {
            getChatHistory(id)
                .then((res) => {
                    const history = res.data || res.chatHistory || res || [];
                    if (Array.isArray(history)) {
                        setChatMessages(
                            history.map((m) => ({
                                role: m.role || (m.sender === "user" ? "user" : "assistant"),
                                content: m.content || m.message || m.text || "",
                            }))
                        );
                    }
                })
                .catch(() => {});
        }
    }, [id, isReady]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleGenerateFlashcards = async () => {
        setGenerating((p) => ({ ...p, flashcards: true }));
        setGenResult((p) => ({ ...p, flashcards: null }));
        try {
            const res = await generateFlashcards(id, flashcardCount);
            setGenResult((p) => ({
                ...p,
                flashcards: { success: true, data: res },
            }));
            // Refresh doc for updated counts
            const doc = await getDocumentById(id);
            setDocument(doc);
        } catch (err) {
            setGenResult((p) => ({
                ...p,
                flashcards: { success: false, error: err.message },
            }));
        } finally {
            setGenerating((p) => ({ ...p, flashcards: false }));
        }
    };

    const handleGenerateQuiz = async () => {
        setGenerating((p) => ({ ...p, quiz: true }));
        setGenResult((p) => ({ ...p, quiz: null }));
        try {
            const res = await generateQuiz(id, quizCount, quizTitle || document?.title);
            setGenResult((p) => ({
                ...p,
                quiz: { success: true, data: res },
            }));
            const doc = await getDocumentById(id);
            setDocument(doc);
        } catch (err) {
            setGenResult((p) => ({
                ...p,
                quiz: { success: false, error: err.message },
            }));
        } finally {
            setGenerating((p) => ({ ...p, quiz: false }));
        }
    };

    const handleSummary = async () => {
        setSummaryOpen(true);
        setSummaryLoading(true);
        setSummaryResult("");
        try {
            const res = await generateSummary(id);
            setSummaryResult(res.data?.summary || res.summary || JSON.stringify(res));
        } catch (err) {
            setSummaryResult("Error: " + (err.message || "Failed to generate summary"));
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const question = chatInput.trim();
        setChatInput("");
        setChatMessages((prev) => [...prev, { role: "user", content: question }]);
        setChatLoading(true);
        try {
            const res = await chatWithDocument(id, question);
            const answer = res.data?.answer || res.answer || res.response || JSON.stringify(res);
            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: answer },
            ]);
        } catch (err) {
            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Error: " + (err.message || "Failed to get response") },
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleExplainConcept = async () => {
        if (!concept.trim()) return;
        setConceptLoading(true);
        setConceptResult("");
        try {
            const res = await explainConcept(id, concept.trim());
            setConceptResult(res.data?.explanation || res.explanation || JSON.stringify(res));
        } catch (err) {
            setConceptResult("Error: " + (err.message || "Failed to explain concept"));
        } finally {
            setConceptLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await deleteDocument(id);
            navigate("/documents");
        } catch (err) {
            setError(err.message || "Failed to delete");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <Link to="/documents" className="text-indigo-400 hover:text-indigo-300 text-sm">
                        ← Back to Documents
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusMap[document?.status] || statusMap.processing;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/documents">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">
                                {document?.title || "Untitled"}
                            </h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Uploaded {new Date(document?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/flashcards/${id}`}>
                        <Button variant="secondary" size="sm" disabled={!isReady}>
                            <Brain className="h-4 w-4" />
                            Flashcards ({document?.flashcardCount || 0})
                        </Button>
                    </Link>
                    <Link to={`/quizzes/${id}`}>
                        <Button variant="secondary" size="sm" disabled={!isReady}>
                            <GraduationCap className="h-4 w-4" />
                            Quizzes ({document?.quizCount || 0})
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {!isReady && (
                <Card className="border-amber-800/50 bg-amber-900/10">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                        <p className="text-sm text-amber-400">
                            Document is still {document?.status}. AI features will be available once processing is complete.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* AI Actions */}
            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="generate" disabled={!isReady}>
                        <Sparkles className="h-4 w-4 mr-1.5" />
                        Generate
                    </TabsTrigger>
                    <TabsTrigger value="chat" disabled={!isReady}>
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="tools" disabled={!isReady}>
                        <Lightbulb className="h-4 w-4 mr-1.5" />
                        AI Tools
                    </TabsTrigger>
                </TabsList>

                {/* Generate Tab */}
                <TabsContent value="generate">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Generate Flashcards */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-purple-400" />
                                    Generate Flashcards
                                </CardTitle>
                                <CardDescription>
                                    Create AI-powered flashcards from this document
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Number of cards</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={flashcardCount}
                                        onChange={(e) => setFlashcardCount(parseInt(e.target.value) || 10)}
                                    />
                                </div>
                                <Button
                                    onClick={handleGenerateFlashcards}
                                    disabled={generating.flashcards || !isReady}
                                    className="w-full"
                                >
                                    {generating.flashcards ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Generate Flashcards
                                        </>
                                    )}
                                </Button>
                                {genResult.flashcards && (
                                    <div
                                        className={`rounded-lg p-3 text-sm ${
                                            genResult.flashcards.success
                                                ? "bg-emerald-900/20 border border-emerald-800/50 text-emerald-400"
                                                : "bg-red-900/20 border border-red-800/50 text-red-400"
                                        }`}
                                    >
                                        {genResult.flashcards.success
                                            ? "Flashcards generated successfully!"
                                            : genResult.flashcards.error}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Generate Quiz */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-amber-400" />
                                    Generate Quiz
                                </CardTitle>
                                <CardDescription>
                                    Create an AI quiz to test your knowledge
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Quiz Title</Label>
                                    <Input
                                        placeholder={document?.title || "Quiz title"}
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Number of questions</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={quizCount}
                                        onChange={(e) => setQuizCount(parseInt(e.target.value) || 10)}
                                    />
                                </div>
                                <Button
                                    onClick={handleGenerateQuiz}
                                    disabled={generating.quiz || !isReady}
                                    className="w-full"
                                >
                                    {generating.quiz ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Generate Quiz
                                        </>
                                    )}
                                </Button>
                                {genResult.quiz && (
                                    <div
                                        className={`rounded-lg p-3 text-sm ${
                                            genResult.quiz.success
                                                ? "bg-emerald-900/20 border border-emerald-800/50 text-emerald-400"
                                                : "bg-red-900/20 border border-red-800/50 text-red-400"
                                        }`}
                                    >
                                        {genResult.quiz.success
                                            ? "Quiz generated successfully!"
                                            : genResult.quiz.error}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat">
                    <Card className="flex flex-col" style={{ height: "500px" }}>
                        <CardHeader className="pb-3 border-b border-slate-700/50">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-400" />
                                Chat with Document
                            </CardTitle>
                            <CardDescription>
                                Ask questions about the content of this document
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.length === 0 && !chatLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Bot className="h-12 w-12 text-slate-600 mb-3" />
                                    <p className="text-slate-400">
                                        Start a conversation about this document
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ask any question and the AI will answer based on the document content
                                    </p>
                                </div>
                            )}
                            {chatMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 ${
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    {msg.role !== "user" && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 flex-shrink-0 mt-0.5">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                                            msg.role === "user"
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-800 text-slate-200 border border-slate-700/50"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.role === "user" && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-shrink-0 mt-0.5">
                                            <User className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 flex-shrink-0">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: "0ms"}} />
                                            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: "150ms"}} />
                                            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: "300ms"}} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </CardContent>
                        <div className="border-t border-slate-700/50 p-4">
                            <form onSubmit={handleChat} className="flex gap-2">
                                <Input
                                    placeholder="Ask a question..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={chatLoading}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    size="icon"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </TabsContent>

                {/* AI Tools Tab */}
                <TabsContent value="tools">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-emerald-400" />
                                    Document Summary
                                </CardTitle>
                                <CardDescription>
                                    Generate an AI summary of the document
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleSummary}
                                    disabled={!isReady}
                                    className="w-full"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Generate Summary
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Explain Concept */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                                    Explain Concept
                                </CardTitle>
                                <CardDescription>
                                    Get an AI explanation of any concept from the document
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={() => setConceptOpen(true)}
                                    disabled={!isReady}
                                    className="w-full"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Explain a Concept
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Summary Dialog */}
            <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-emerald-400" />
                            Document Summary
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[55vh] pr-2">
                        {summaryLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="lg" text="Generating summary..." />
                            </div>
                        ) : (
                            <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {summaryResult}
                            </div>
                        )}
                    </div>
                    {!summaryLoading && summaryResult && (
                        <DialogFooter>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => copyToClipboard(summaryResult)}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Concept Dialog */}
            <Dialog open={conceptOpen} onOpenChange={setConceptOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                            Explain Concept
                        </DialogTitle>
                        <DialogDescription>
                            Enter a concept from the document to get an AI explanation
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter a concept (e.g., React Hooks, Virtual DOM)"
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                disabled={conceptLoading}
                                className="flex-1"
                                onKeyDown={(e) => e.key === "Enter" && handleExplainConcept()}
                            />
                            <Button onClick={handleExplainConcept} disabled={conceptLoading || !concept.trim()}>
                                {conceptLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {conceptResult && (
                            <div className="overflow-y-auto max-h-[40vh]">
                                <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {conceptResult}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
