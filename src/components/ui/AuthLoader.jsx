const AuthLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
                <img
                    src="/vidyagxp_logo.png"
                    alt="VidyaGxP"
                    className="mb-6 h-14 w-auto object-contain"
                />

                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#F28C00]" />

                <p className="mt-4 text-[12px] font-medium text-slate-400">
                    Loading your workspace...
                </p>
            </div>
        </div>
    );
};

export default AuthLoader;