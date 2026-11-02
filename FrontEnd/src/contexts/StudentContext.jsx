import { createContext, useContext, useState, useEffect } from "react";

const StudentContext = createContext(null);

const STORAGE_KEY = "student_auth";

export const StudentProvider = ({ children }) => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setStudent(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setLoading(false);
    }, []);

    const loginStudent = (userData, token) => {
        const payload = { ...userData, token };
        setStudent(payload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    };

    const logoutStudent = () => {
        setStudent(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const isStudent = student?.role === "student";

    return (
        <StudentContext.Provider
            value={{
                student,
                loading,
                isStudent,
                isAuthenticated: !!student,
                loginStudent,
                logoutStudent
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error("useStudent must be used within a StudentProvider");
    }
    return context;
};