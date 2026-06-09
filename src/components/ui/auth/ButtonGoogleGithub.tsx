const SocialLoginButtons = () => {
    const handleGoogle = () => {
        // Redirect langsung ke Laravel
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`;
    };

    const handleGithub = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/github/redirect`;
    };

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={handleGoogle}
                className="flex items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50"
            >
                <img src="/google-icon.svg" className="w-5 h-5" />
                Login dengan Google
            </button>

            <button
                onClick={handleGithub}
                className="flex items-center justify-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50"
            >
                <img src="/github-icon.svg" className="w-5 h-5" />
                Login dengan GitHub
            </button>
        </div>
    );
};

export default SocialLoginButtons;