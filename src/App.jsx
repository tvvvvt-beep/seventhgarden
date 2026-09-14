import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import Header from "./components/Header";
import InAppBrowserBanner from "./components/InAppBrowserBanner";
import Navbar from "./components/Navbar";
import TipModal from "./components/TipModal";
import HomePage from "./pages/HomePage";
import LineupPage from "./pages/LineupPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import MyPage from "./pages/MyPage";
import BackOffice from "./pages/BackOffice";
import RecentTipsFeed from "./components/RecentTipsFeed";
import { fetchArtistsList, fetchRecentTips } from "./firebase/services";

function MainApp() {
  const { currentUser, userProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState("home"); // home | lineup | feed | mypage | detail
  const [activeEventTab, setActiveEventTab] = useState("vol_3"); // vol_3 | vol_2
  const [artists, setArtists] = useState([]);
  const [tips, setTips] = useState([]);
  
  // モーダル管理: { artist: object | null, mode: 'point' | 'paypay' }
  const [tipModalConfig, setTipModalConfig] = useState(null);
  const [selectedArtistDetail, setSelectedArtistDetail] = useState(null);

  const loadData = async () => {
    const fetchedArtists = await fetchArtistsList();
    setArtists(fetchedArtists);
    const fetchedTips = await fetchRecentTips();
    setTips(fetchedTips);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTipModal = (artist = null, mode = "paypay") => {
    setTipModalConfig({ artist, mode });
  };

  const handleSelectArtist = (artist) => {
    setSelectedArtistDetail(artist);
    setActiveTab("detail");
  };

  const handleTipSuccess = () => {
    loadData();
  };

  const userTips = currentUser 
    ? tips.filter(t => t.fromUserId === currentUser.uid)
    : [];

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col font-sans overflow-x-hidden max-w-full">
      {/* Sticky Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* In-App Browser Warning Banner (LINE, Instagram etc) */}
      <InAppBrowserBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24 overflow-x-hidden">
        {activeTab === "home" && (
          <HomePage
            artists={artists}
            tips={tips}
            onOpenTipModal={handleOpenTipModal}
            onSelectArtist={handleSelectArtist}
            setActiveTab={setActiveTab}
            setActiveEventTab={setActiveEventTab}
          />
        )}

        {activeTab === "lineup" && (
          <LineupPage
            artists={artists}
            onOpenTipModal={handleOpenTipModal}
            onSelectArtist={handleSelectArtist}
            activeEventTab={activeEventTab}
            setActiveEventTab={setActiveEventTab}
          />
        )}

        {activeTab === "feed" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">LIVE TIP FEED</h2>
              <p className="text-xs text-gray-400 font-mono">フロアから届いたリアルタイム応援メッセージ</p>
            </div>
            <RecentTipsFeed tips={tips} />
          </div>
        )}

        {activeTab === "detail" && selectedArtistDetail && (
          <ArtistDetailPage
            artist={selectedArtistDetail}
            allTips={tips}
            onBack={() => setActiveTab("lineup")}
            onOpenTipModal={handleOpenTipModal}
          />
        )}

        {activeTab === "mypage" && (
          <MyPage userTips={userTips} />
        )}

        {activeTab === "backoffice" && (
          <BackOffice
            onEventUpdated={() => loadData()}
          />
        )}
      </main>

      {/* Tip Modal */}
      {tipModalConfig && (
        <TipModal
          artist={tipModalConfig.artist}
          initialMode={tipModalConfig.mode}
          onClose={() => setTipModalConfig(null)}
          onSuccess={handleTipSuccess}
        />
      )}

      {/* Mobile Fixed Bottom Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
