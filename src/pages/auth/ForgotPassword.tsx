import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../../lib/axios";
import type { ApiError } from "../../types/auth";
import { AxiosError } from 'axios';

const ForgotPassword = () => {
    const [email, setEmail]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(false);
    const [error, setError]       = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/forgot-password', { 
                email,
                frontend_url: window.location.origin
            });
            setSuccess(true);
        } catch (err) {
            const e = err as AxiosError<ApiError>;
            setError(e.response?.data?.message ?? 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
                    <div className="text-4xl mb-4">📧</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Cek Email Kamu!
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Link reset password telah dikirim ke <strong>{email}</strong>.
                        Link akan kadaluarsa dalam 60 menit.
                    </p>
                    <Link to="/login" className="text-indigo-600 hover:underline text-sm">
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Lupa Password</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Masukkan email kamu dan kami akan mengirimkan link reset password.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="emailkamu@gmail.com"
                            required
                            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Ingat password?{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;