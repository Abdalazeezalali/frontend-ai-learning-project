import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    return isAuthenticated ? (
        <Layout>
            <Outlet />
        </Layout>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute;