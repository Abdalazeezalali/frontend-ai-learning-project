import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDocuments, uploadDocument, deleteDocument } from "../services/documentServices";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Skeleton } from "../components/ui/Skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/Dialog";
import {
    FileText,
    Upload,
    Trash2,
    Eye,
    Brain,
    GraduationCap,
    Loader2,
    Plus,
    FileUp,
    AlertCircle,
    Search,
} from "lucide-react";

const statusMap = {
    processing: { variant: "warning", label: "Processing" },
    ready: { variant: "success", label: "Ready" },
    failed: { variant: "destructive", label: "Failed" },
};

export default function DocumentListPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState(null);

    const fetchDocuments = useCallback(async () => {
        try {
            const data = await getDocuments();
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to load documents");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setUploadError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title || file.name.replace(".pdf", ""));
            await uploadDocument(formData);
            setUploadOpen(false);
            setFile(null);
            setTitle("");
            fetchDocuments();
        } catch (err) {
            setUploadError(err.message || "Failed to upload");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d._id !== id));
        } catch (err) {
            setError(err.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    const filteredDocs = documents.filter((d) =>
        d.title?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Documents</h1>
                    <p className="text-slate-400 mt-1">
                        Upload PDFs and unlock AI-powered learning
                    </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Upload PDF
                </Button>
            </div>

            {/* Search */}
            {documents.length > 0 && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Documents Grid */}
            {filteredDocs.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-16 w-16 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">
                        {documents.length === 0 ? "No documents yet" : "No results found"}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        {documents.length === 0
                            ? "Upload your first PDF to get started"
                            : "Try a different search term"}
                    </p>
                    {documents.length === 0 && (
                        <Button onClick={() => setUploadOpen(true)} variant="secondary">
                            <Upload className="h-4 w-4" />
                            Upload PDF
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDocs.map((doc) => {
                        const status = statusMap[doc.status] || statusMap.processing;
                        return (
                            <Card
                                key={doc._id}
                                className="group hover:border-slate-600 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 flex-shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <CardTitle className="text-base truncate">
                                                    {doc.title || "Untitled"}
                                                </CardTitle>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Brain className="h-3.5 w-3.5" />
                                            {doc.flashcardCount || 0} cards
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            {doc.quizCount || 0} quizzes
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/documents/${doc._id}`} className="flex-1">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8"
                                            onClick={() => handleDelete(doc._id)}
                                            disabled={deleting === doc._id}
                                        >
                                            {deleting === doc._id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Upload a PDF to generate flashcards, quizzes, and more
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        {uploadError && (
                            <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3 text-sm text-red-400">
                                {uploadError}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Title (optional)</Label>
                            <Input
                                placeholder="Document title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>PDF File</Label>
                            <div
                                className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer"
                                onClick={() =>
                                    document.getElementById("file-upload").click()
                                }
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0])}
                                    className="hidden"
                                />
                                <FileUp className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                                {file ? (
                                    <p className="text-sm text-indigo-400">{file.name}</p>
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        Click to select a PDF file
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUploadOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!file || uploading}>
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
