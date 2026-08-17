import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading...", fullscreen = false }) => {
  const content = (
    <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-500">
      <Loader2 size={20} className="animate-spin" />
      <span>{text}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
