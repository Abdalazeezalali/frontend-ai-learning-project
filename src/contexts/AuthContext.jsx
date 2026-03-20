import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as loginService, register as registerService, getMe, logout as logoutService } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            setIsAuthenticated(false);
            return;
        }
        try {
            const data = await getMe();
            setUser(data.user || data);
            setIsAuthenticated(true);
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const data = await loginService(email, password);
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
        }
        setIsAuthenticated(true);
        return data;
    };

    const register = async (username, email, password) => {
        const data = await registerService(username, email, password);
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
        }
        setIsAuthenticated(true);
        return data;
    };

    const logout = () => {
        logoutService();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
