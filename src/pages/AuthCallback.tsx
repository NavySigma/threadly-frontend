// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const AuthCallback = () => {
    const navigate  = useNavigate();
    const [params]  = useSearchParams();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            navigate('/login?error=' + error);
            return;
        }

        loginWithToken(token).then(() => navigate('/'));
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Sedang memproses login...</p>
        </div>
    );
};

export default AuthCallback;