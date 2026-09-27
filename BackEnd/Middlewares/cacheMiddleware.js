let courseCache = null;
let cacheExpiryTime = null;

export const courseCacheGate = (req, res, next) => {
    const currentTime = Date.now();

    if (courseCache && cacheExpiryTime && currentTime < cacheExpiryTime) {
        console.log("⚡ Cache Hit: Serving catalog data from system memory container!");
        return res.status(200).json(courseCache);
    }

    console.log("🗄️ Cache Miss: Requesting fresh data rows directly from MongoDB Atlas...");
    
    const originalJsonSend = res.json;
    res.json = (body) => {
        
        if (res.statusCode === 200) {
            courseCache = body;
            cacheExpiryTime = Date.now() + 5 * 60 * 1000; // Set memory lifespan to exactly 5 minutes
        }
        return originalJsonSend.call(res, body);
    };

    next();
};

export const clearCourseCache = () => {
    console.log("🧹 Cache Purge Hook: Wiping stale memory cache lines...");
    courseCache = null;
    cacheExpiryTime = null;
};
