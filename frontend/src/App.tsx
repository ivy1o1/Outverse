import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "./home/HomePage";
import { ExplorePage } from "./missions/ExplorePage";
import { MissionBriefingPage } from "./missions/MissionBriefingPage";
import { ActiveMissionsPage } from "./missions/ActiveMissionsPage";
import { ReflectionPage } from "./reflection/ReflectionPage";
import { JournalPage } from "./journal/JournalPage";
import { JournalEntryPage } from "./journal/JournalEntryPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Static paths first so `/missions/active` is never read as an id. */}
        <Route path="/" element={<HomePage />} />
        <Route path="/missions/active" element={<ActiveMissionsPage />} />
        <Route path="/missions/:id/reflect" element={<ReflectionPage />} />
        <Route path="/missions/:id" element={<MissionBriefingPage />} />
        <Route path="/explore/:pillar" element={<ExplorePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/:id" element={<JournalEntryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
