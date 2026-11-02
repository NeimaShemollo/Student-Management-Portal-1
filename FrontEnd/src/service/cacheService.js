// 📦 Simple, high-performance in-memory cache container
let courseCache = null;
let cacheExpiryTime = null;

// 1. Get Cached Catalog Data
export const getCachedCourses = () => {
    const currentTime = Date.now();
    if (courseCache && cacheExpiryTime && currentTime < cacheExpiryTime) {
        return courseCache;
    }
    return null; // Cache expired or empty
};

// 2. Set/Save Data Into Cache Memory (Valid for 10 Minutes)
export const setCourseCache = (data) => {
    courseCache = data;
    cacheExpiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes lifespan
};

// 3. 🌟 THE AUTOMATED HOOK: Instantly flushes memory cache clean
export const clearCourseCache = () => {
    console.log("⚡ Cache Purge: Database modification detected. Old memory cache cleared!");
    courseCache = null;
    cacheExpiryTime = null;
};
