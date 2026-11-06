
export const INITIAL_TIPS = [
  {
    id: "tip_mock_1",
    fromUserId: "user_mock_1",
    fromUserName: "KENJI_N",
    toArtistId: "artist_yamanaka",
    toArtistName: "toru yamanaka (Dumb Type)",
    amount: 500,
    message: "山中透さんのセット圧巻でした！最高です！🔥",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: "tip_mock_2",
    fromUserId: "user_mock_2",
    fromUserName: "SORA",
    toArtistId: "artist_tamako",
    toArtistName: "tamako",
    amount: 300,
    message: "クリスタルボウルの響きでオープニングから整いました✨",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: "tip_mock_3",
    fromUserId: "user_mock_3",
    fromUserName: "MEGUMI",
    toArtistId: "artist_fish_hiwatashi",
    toArtistName: "FisH + HIWATASHI",
    amount: 300,
    message: "プロジェクションマッピングとライブペイントの融合すごい！🎨",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString()
  },
  {
    id: "tip_mock_4",
    fromUserId: "user_mock_4",
    fromUserName: "TAKASHI",
    toArtistId: "artist_sen_jerry",
    toArtistName: "Live P.A.: Sen & Jerry",
    amount: 300,
    message: "言葉と音の響きが唯一無二でした！👏",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString()
  }
];