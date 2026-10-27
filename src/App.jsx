import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import NetworkStatusModal from "./components/common/NetworkStatus/Networkstatusmodal";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
       <NetworkStatusModal />
      <AppRoutes />
    </>
  );
}

export default App;