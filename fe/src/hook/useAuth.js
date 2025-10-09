import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const [roles, setRoles] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        setIsLoading(true);


        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                const scope = decodedToken.scope;
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    console.log("Token đã hết hạn.");
                    setIsAuthenticated(false);
                    localStorage.removeItem("username");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("token");
                    localStorage.removeItem("avatar_url");
                } else {
                    setIsAuthenticated(!!token);
                    if (scope) {
                        const role = scope.replace('ROLE_', '').toLowerCase();
                        setRoles([role]);
                    }
                }

            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                setRoles([]);
                setIsAuthenticated(false);
            }
        } else {
            setRoles([]);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    const hasRole = (requiredRole) => {
        const lowerCaseRoles = roles.map(role => role.toLowerCase());
        return lowerCaseRoles.includes(requiredRole.toLowerCase());
    };

    const isAdmin = () => hasRole('admin');

    return { isAuthenticated, roles, hasRole, isAdmin, isLoading };
};

export default useAuth;