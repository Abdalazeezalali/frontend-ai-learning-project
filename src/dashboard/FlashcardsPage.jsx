import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getFlashcardsForDocument, reviewFlashcard, toggleStar } from "../services/flashcardService";
import { getDocumentById } from "../services/documentServices";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Skeleton } from "../components/ui/Skeleton";
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    Star,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Brain,
    Shuffle,
} from "lucide-react";

export default function FlashcardsPage() {
    const { documentId } = useParams();
    const [flashcardData, setFlashcardData] = useState(null);
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [document, setDocument] = useState(null);
    const [reviewed, setReviewed] = useState(new Set());

    const fetchData = useCallback(async () => {
        try {
            const [flashRes, docRes] = await Promise.all([
                getFlashcardsForDocument(documentId),
                getDocumentById(documentId).catch(() => null),
            ]);
            setDocument(docRes);
            const data = flashRes.data || flashRes;
            setFlashcardData(data);
            const cardList = data.cards || data.flashcards || (Array.isArray(data) ? data : []);
            setCards(cardList);
        } catch (err) {
            setError(err.message || "Failed to load flashcards");
        } finally {
            setLoading(false);
        }
    }, [documentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentCard = cards[currentIndex];

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setFlipped(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setFlipped(false);
        }
    };

    const handleReview = async () => {
        if (!currentCard) return;
        const cardId = flashcardData?._id || flashcardData?.id;
        if (!cardId) return;
        try {
            await reviewFlashcard(cardId, currentIndex);
            setReviewed((prev) => new Set([...prev, currentIndex]));
        } catch {
            // Silently handle
        }
    };

    const handleToggleStar = async () => {
        if (!currentCard) return;
        const cardId = flashcardData?._id || flashcardData?.id;
        if (!cardId) return;
        try {
            await toggleStar(cardId);
            setCards((prev) =>
                prev.map((c, i) =>
                    i === currentIndex ? { ...c, isStarred: !c.isStarred } : c
                )
            );
        } catch {
            // Silently handle
        }
    };

    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setFlipped(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-80 max-w-2xl mx-auto" />
                <div className="flex justify-center gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <Link to={`/documents/${documentId}`} className="text-indigo-400 hover:text-indigo-300 text-sm">
                        ← Back to Document
                    </Link>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link to={`/documents/${documentId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Flashcards</h1>
                </div>
                <Card className="flex flex-col items-center justify-center py-16">
                    <Brain className="h-16 w-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No flashcards yet</h3>
                    <p className="text-sm text-slate-400 mb-4">Generate flashcards from the document detail page</p>
                    <Link to={`/documents/${documentId}`}>
                        <Button variant="secondary">Go to Document</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const progressPercent = ((currentIndex + 1) / cards.length) * 100;
    const reviewedPercent = (reviewed.size / cards.length) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to={`/documents/${documentId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {document?.title || "Flashcards"}
                        </h1>
                        <p className="text-sm text-slate-400">
                            Card {currentIndex + 1} of {cards.length} • {reviewed.size} reviewed
                        </p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleShuffle}>
                    <Shuffle className="h-4 w-4" />
                    Shuffle
                </Button>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} />
            </div>

            {/* Flashcard */}
            <div className="max-w-2xl mx-auto perspective-1000">
                <div
                    className="relative cursor-pointer"
                    onClick={() => setFlipped(!flipped)}
                    style={{ minHeight: "300px" }}
                >
                    <Card
                        className={`absolute inset-0 transition-all duration-500 backface-hidden ${
                            flipped ? "opacity-0 rotate-y-180 pointer-events-none" : "opacity-100"
                        }`}
                    >
                        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
                            <Badge variant="secondary" className="mb-4">
                                Question
                            </Badge>
                            {currentCard.difficulty && (
                                <Badge
                                    variant={
                                        currentCard.difficulty === "hard"
                                            ? "destructive"
                                            : currentCard.difficulty === "medium"
                                            ? "warning"
                                            : "success"
                                    }
                                    className="mb-3"
                                >
                                    {currentCard.difficulty}
                                </Badge>
                            )}
                            <p className="text-lg text-white leading-relaxed">
                                {currentCard.question || currentCard.front || "No question"}
                            </p>
                            <p className="text-xs text-slate-500 mt-6">Click to reveal answer</p>
                        </CardContent>
                    </Card>
                    <Card
                        className={`absolute inset-0 transition-all duration-500 backface-hidden ${
                            flipped ? "opacity-100" : "opacity-0 rotate-y-180 pointer-events-none"
                        }`}
                    >
                        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
                            <Badge variant="default" className="mb-4">
                                Answer
                            </Badge>
                            <p className="text-lg text-white leading-relaxed whitespace-pre-wrap">
                                {currentCard.answer || currentCard.back || "No answer"}
                            </p>
                            <p className="text-xs text-slate-500 mt-6">Click to see question</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                    variant={currentCard.isStarred ? "default" : "outline"}
                    size="icon"
                    onClick={handleToggleStar}
                    className={currentCard.isStarred ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                    <Star className={`h-5 w-5 ${currentCard.isStarred ? "fill-current" : ""}`} />
                </Button>

                <Button
                    variant={reviewed.has(currentIndex) ? "secondary" : "outline"}
                    onClick={handleReview}
                    className="px-6"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {reviewed.has(currentIndex) ? "Reviewed" : "Mark Reviewed"}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFlipped(!flipped)}
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Review progress */}
            <div className="max-w-2xl mx-auto space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Reviewed</span>
                    <span>{reviewed.size}/{cards.length}</span>
                </div>
                <Progress value={reviewedPercent} />
            </div>
        </div>
    );
}
