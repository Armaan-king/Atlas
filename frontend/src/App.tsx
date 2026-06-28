import { PageShell } from "./components/layout/PageShell";

import { useMockData } from "./hooks/useMockData";
import { useAppStore } from "./store/useAppStore";
import { Chat } from "./pages/Chat";

function App() {
  useMockData();
  const chatOpen = useAppStore((s) => s.chatModalOpen);
  const setChatModalOpen = useAppStore((s) => s.setChatModalOpen);

  return (
    <>
      <PageShell />

      {chatOpen && <Chat onClose={() => setChatModalOpen(false)} />}
    </>
  );
}

export default App;
