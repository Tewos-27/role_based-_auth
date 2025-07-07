const authorize = (roles = []) => {
    // roles param can be a single role string (e.g. 'admin') or an array of roles (e.g. ['admin', 'moderator'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found in request' });
        }
        if (roles.length && !roles.includes(req.user.role)) {
            // user's role is not authorized
            return res.status(403).json({ message: `Forbidden: User role '${req.user.role}' is not authorized to access this route.` });
        }
        // authentication and authorization successful
        next();
    };
};
module.exports = { authorize };