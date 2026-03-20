import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFlashcardSets } from "../services/flashcardService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Brain, ArrowRight, FileText, Star, Clock } from "lucide-react";

export default function FlashcardsListPage() {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const res = await getFlashcardSets();
                const data = res.data || res;
                setSets(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Failed to load flashcard sets");
            } finally {
                setLoading(false);
            }
        };
        fetchSets();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Flashcard Sets</h1>
                <p className="text-slate-400 mt-1">Study your AI-generated flashcards</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {sets.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16">
                    <Brain className="h-16 w-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No flashcard sets yet</h3>
                    <p className="text-sm text-slate-400 mb-4">Generate flashcards from a document</p>
                    <Link to="/documents">
                        <Button variant="secondary">
                            <FileText className="h-4 w-4" />
                            Go to Documents
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sets.map((set) => (
                        <Card
                            key={set._id}
                            className="group hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-400">
                                            <Brain className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base truncate max-w-[180px]">
                                                {set.documentTitle || set.title || "Flashcard Set"}
                                            </CardTitle>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {new Date(set.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {set.isStarred && (
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-3">
                                    <Badge variant="secondary">
                                        {set.cards?.length || set.cardCount || 0} cards
                                    </Badge>
                                </div>
                                <Link to={`/flashcards/${set.documentId || set.document}`}>
                                    <Button variant="secondary" size="sm" className="w-full group/btn">
                                        Study Now
                                        <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
