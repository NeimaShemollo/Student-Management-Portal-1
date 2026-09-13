import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getInstructors } from "../service/userService.js";
import { api } from "../service/axiosInstance.js";

const InstructorContext = createContext(null);

const STORAGE_KEY = "instructor_auth";

export const InstructorProvider = ({ children }) => {
    // ---- Auth state (the logged-in instructor's own session) ----
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setInstructor(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setLoading(false);
    }, []);

    const loginInstructor = (userData, token) => {
        const payload = { ...userData, token };
        setInstructor(payload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    };

    const logoutInstructor = () => {
        setInstructor(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const isInstructor = instructor?.role === "instructor";

    // ---- Instructors list state (admin's fetched list of all instructors) ----
    const [instructors, setInstructors] = useState([]);
    const [instructorsLoading, setInstructorsLoading] = useState(false);
    const [instructorsError, setInstructorsError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchInstructors = useCallback(async () => {
        try {
            setInstructorsLoading(true);
            setInstructorsError("");
            const res = await getInstructors();
            const rows = res.data?.data ?? res.data ?? [];
            setInstructors(Array.isArray(rows) ? rows : []);
        } catch (err) {
            setInstructorsError(err.response?.data?.message || err.message || "Failed to load instructors");
        } finally {
            setInstructorsLoading(false);
        }
    }, []);

    const updateInstructorStatus = useCallback(async (instructorId, newStatus) => {
        setUpdatingId(instructorId);
        setInstructorsError("");
        try {
            await api.patch(`/users/status/${instructorId}`, { status: newStatus });
            setInstructors((prev) =>
                prev.map((ins) =>
                    ins._id === instructorId ? { ...ins, status: newStatus } : ins
                )
            );
        } catch (err) {
            setInstructorsError(err.response?.data?.message || "Failed to update instructor status");
        } finally {
            setUpdatingId(null);
        }
    }, []);

    return (
        <InstructorContext.Provider
            value={{
                // auth
                instructor,
                loading,
                isInstructor,
                isAuthenticated: !!instructor,
                loginInstructor,
                logoutInstructor,

                // global instructors list
                instructors,
                instructorsLoading,
                instructorsError,
                updatingId,
                fetchInstructors,
                updateInstructorStatus
            }}
        >
            {children}
        </InstructorContext.Provider>
    );
};

export const useInstructor = () => {
    const context = useContext(InstructorContext);
    if (!context) {
        throw new Error("useInstructor must be used within an InstructorProvider");
    }
    return context;
};