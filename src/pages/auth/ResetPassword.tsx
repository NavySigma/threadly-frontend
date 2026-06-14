// src/pages/ResetPassword.tsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from "../../lib/axios";
import type { ApiError } from "../../types/auth";
import { AxiosError } from 'axios';

const ResetPassword = () => {
    const navigate              = useNavigate();
    const [params]              = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [form, setForm]       = useState({
        password: '',
        password_confirmation: '',
    });

    const token = params.get('token') ?? '';
    const email = params.get('email') ?? '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (form.password !== form.password_confirmation) {
            setError('Password tidak cocok.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/reset-password', {
                email,
                token,
                password:              form.password,
                password_confirmation: form.password_confirmation,
            });

            navigate('/login?reset=success');
        } catch (err) {
            const e = err as AxiosError<ApiError>;
            setError(e.response?.data?.message ?? 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Link Tidak Valid</h2>
                    <p className="text-gray-500 mb-6">
                        Link reset password tidak valid atau sudah kadaluarsa.
                    </p>
                    <Link to="/forgot-password" className="text-indigo-600 hover:underline text-sm">
                        Minta link baru
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Masukkan password baru untuk akun <strong>{email}</strong>
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password Baru
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Minimal 8 karakter"
                            required
                            minLength={8}
                            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            value={form.password_confirmation}
                            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                            placeholder="Ulangi password baru"
                            required
                            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Kembali ke Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;