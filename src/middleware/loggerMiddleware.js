export const logger = (req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Start`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};

export const errorLogger = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message} - ${req.method} ${req.url}`);
    next(err); 
};