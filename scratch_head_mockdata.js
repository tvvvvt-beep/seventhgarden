export const EVENT_INFO = {
  title: "7th GARDEN 09/17",
  subtitle: "PLACE FOR ART AND MUSIC",
  date: "2026.09.17 (THU)",
  openTime: "18:00 - 24:00",
  venue: "Compufunk Records & BAR (OSAKA)",
  description: "3回目となる7th GARDEN。トワイライトタイムに響くtamakoのクリスタルボウルを合図に、夜が動き出す。四半世紀にわたってアンビエントの現場「U.V.」を継続してきたDUNE、チュニジアから来たポエトリーアーティストSen。そして、この夜のハイライトとなるのは、ダムタイプの初期からのメンバー山中透。気鋭の女性DJ KASSIS、映像、サウンドデザイン、DJ、AIなど、ジャンルを横断し続けるtvvtも加わり、レジェンドからニューカマーまでが肩の力を抜いてトライする。高いクォリティで展開するコンテンツだが、DJとギャラリーのあいだにボーダーはなく、誰もが等価にただそこに存在し、佇むことができる「庭」——7th GARDEN、9/17。",
  entranceFee: "Charge Free",
  hashtag: "#7thGarden #CompuFunk #PlaceForArtAndMusic"
};

export const INITIAL_ARTISTS = [
  {
    id: "artist_tamako",
    name: "tamako",
    roleLabel: "オープニング",
    genre: "CRYSTAL BOWL / SOUND HEALING",
    stage: "MAIN STAGE",
    time: "18:00 - 18:15",
    duration: "15m",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    bio: "【LIVE ACT / オープニング】クリスタルボウルの神秘的な倍音響が織りなすサウンドヒーリング。五感を満たす空間調整パフォーマンス。",
    totalPoints: 9800,
    likesCount: 120,
    sns: { instagram: "tamako_crystalbowl" }
  },
  {
    id: "artist_sen11",
    name: "Selector: Sen 11",
    roleLabel: "Selector",
    genre: "POETRY / SELECTOR",
    stage: "MAIN STAGE",
    time: "18:15 - 19:00",
    duration: "45m",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    bio: "チュニジアから来日したポエトリーのアーティスト。選曲家として、音と言葉の境界を横断する。",
    totalPoints: 8400,
    likesCount: 95,
    sns: { instagram: "sen11_poetry" }
  },
  {
    id: "artist_dune",
    name: "Dune (U.V.)",
    roleLabel: "DJ / Ambient",
    genre: "EXPERIMENTAL / SOUNDSCAPE",
    stage: "MAIN STAGE",
    time: "19:00 - 19:45",
    duration: "45m",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    bio: "四半世紀にわたってアンビエントの現場「U.V.」を継続してきた第一人者。深遠なサウンドスケープと立体音響による空間実験を展開。",
    totalPoints: 11200,
    likesCount: 165,
    sns: { instagram: "dune_uv_official" },
    supportGoal: {
      title: "写真家として一歩進むための良いレンズが欲しい！",
      description: "四半世紀のDJ活動に加え、写真家としても表現の幅を広げる新たな一歩を踏み出したいと考えています。次の作品作りに向けた高品質なカメラレンズ導入を目指してPayPay投げ銭を募集中！ぜひ応援をお願いします。",
      tag: "PHOTO / LENS",
      targetAmount: "¥50,000",
      memoKeyword: "DUNE"
    }
  },
  {
    id: "artist_sen_jerry",
    name: "Live P.A.: Sen & Jerry",
    roleLabel: "Live P.A.",
    genre: "POETRY / LIVE P.A.",
    stage: "MAIN STAGE",
    time: "19:45 - 20:15",
    duration: "30m",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    bio: "チュニジアから来日したポエトリーのアーティストSenとJerryによるLive P.A.ユニット。音と言葉の境界を横断する。",
    totalPoints: 7600,
    likesCount: 88,
    sns: { instagram: "sen_jerry_live" }
  },
  {
    id: "artist_youngandold",
    name: "youngANDoldNEVERdie",
    roleLabel: "DJ / Newcomer",
    genre: "TECHNO / JAZZ",
    stage: "MAIN STAGE",
    time: "20:15 - 20:55",
    duration: "40m",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    bio: "7th GARDEN初登場のニューカマー。テクノからジャズまで、ジャンルを問わず横断する選曲でフロアに新しい風を吹き込む。",
    totalPoints: 9100,
    likesCount: 104,
    sns: { instagram: "youngandoldneverdie" }
  },
  {
    id: "artist_yamanaka",
    name: "toru yamanaka (Dumb Type)",
    roleLabel: "メインアクト",
    genre: "TECHNO / ELECTRONIC / MINIMAL",
    stage: "MAIN STAGE",
    time: "20:55 - 21:55",
    duration: "60m",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    bio: "ダムタイプの初期からのメンバーとして知られる、関西シーンを代表するサウンドアーティスト。音と光が共鳴する没入型セットでフロアを魅了する。",
    totalPoints: 16500,
    likesCount: 210,
    sns: { instagram: "toruyamanaka_art" }
  },
  {
    id: "artist_kassis",
    name: "KASSIS (MOKSA.)",
    roleLabel: "DJ",
    genre: "MINIMAL TECHNO / LEFTFIELD",
    stage: "MAIN STAGE",
    time: "21:55 - 22:40",
    duration: "45m",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
    bio: "MOKSA.名義でも活動する気鋭の女性DJ。ミニマルテクノと繊細な音響テクスチャーが織りなす上質なラウンジセット。",
    totalPoints: 8900,
    likesCount: 115,
    sns: { instagram: "kassis_moksa" },
    supportGoal: {
      title: "福井・大阪の二重拠点化に伴う制作・活動環境の整備！",
      description: "福井と大阪の二重拠点での活動が本格スタート！2つの拠点を往来しながら良質な音楽を届け続けるため、移動・スタジオ制作環境の整備へのPayPay投げ銭サポートを大歓迎しています！",
      tag: "DUAL BASE / STUDIO",
      targetAmount: "¥30,000",
      memoKeyword: "KASSIS"
    }
  },
  {
    id: "artist_tvvt",
    name: "tvvt",
    roleLabel: "ラストアクト",
    genre: "DEEP HOUSE / CHILL TECHNO",
    stage: "MAIN STAGE",
    time: "22:40 - 23:25",
    duration: "45m",
    image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=600&q=80",
    bio: "映像、サウンドデザイン、DJ、AIなど、ジャンルを横断し続けるクリエイター。7th Gardenのオーガナイズも手掛けながら、ディープで洗練された電子音響空間で夜を締めくくる。",
    totalPoints: 13800,
    likesCount: 172,
    sns: { instagram: "tvvt_7thgarden" }
  },
  {
    id: "artist_fish_hiwatashi",
    name: "FisH + HIWATASHI",
    roleLabel: "VISUAL ACT",
    genre: "LIVE PAINT + PROJECTION MAPPING",
    stage: "VISUAL STAGE",
    time: "18:00 - 24:00 (ALL NIGHT)",
    duration: "ALL NIGHT",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    bio: "【SPECIAL VISUAL ACT】ライブペイントとプロジェクションマッピングを融合させるユニット。描かれていく筆致にリアルタイムで映像が重なり合う、一夜限りのデジタルアート演出。",
    totalPoints: 14500,
    likesCount: 185,
    sns: { instagram: "fish_hiwatashi_art" }
  }
];

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

export const PAST_EVENTS = [
  {
    id: "vol_2",
    vol: "Vol.2",
    title: "7TH GARDEN Vol.2",
    subtitle: "PLACE FOR ART AND MUSIC",
    date: "2026.07.30 (THU)",
    openTime: "18:00 - 24:00",
    venue: "COMPUFUNK RECORDS (OSAKA)",
    description: "アート・サウンド・テクノロジーが交差するチルアウトコミュニティラウンジ。大阪・コンピュファンクで開催された第2回実験イベント。",
    entranceFee: "Charge Free",
    hashtag: "#7thGarden #CompuFunk #Vol2Archive",
    artists: [
      {
        id: "v2_artist_9",
        name: "tamako",
        roleLabel: "LIVE ACT",
        genre: "CRYSTAL BOWL / SOUND HEALING",
        stage: "MAIN STAGE",
        time: "LIVE ACT",
        duration: "LIVE",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        bio: "【LIVE ACT】クリスタルボウルの神秘的な倍音響が織りなすサウンドヒーリング。五感を満たす空間調整パフォーマンス。",
        totalPoints: 9800,
        likesCount: 120,
        sns: { instagram: "tamako_crystalbowl" }
      },
      {
        id: "v2_artist_10",
        name: "FisH + HIWATASHI",
        roleLabel: "VISUAL ACT",
        genre: "LIVE PAINT + VISUALS",
        stage: "MAIN STAGE",
        time: "VISUAL ACT",
        duration: "ALL NIGHT",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        bio: "【SPECIAL VISUAL ACT】リアルタイムで描かれるライヴペイントと音響連動生成ビジュアルが即興交差するデジタルアート演出。",
        totalPoints: 14500,
        likesCount: 185,
        sns: { instagram: "fish_hiwatashi_art" }
      },
      {
        id: "v2_artist_4",
        name: "Otani",
        roleLabel: "DJ",
        genre: "DISCO / HOUSE / FUNK",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
        bio: "グルーヴィーなソウル＆ディスコトラックを縦横無尽に選曲する熟練DJ。",
        totalPoints: 8700,
        likesCount: 95,
        sns: { instagram: "otani_dj" }
      },
      {
        id: "v2_artist_5",
        name: "kassis",
        roleLabel: "DJ",
        genre: "MINIMAL TECHNO / LEFTFIELD",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80",
        bio: "ミニマルテクノと繊細な音響テクスチャーが織りなす上質なラウンジセット。",
        totalPoints: 6700,
        likesCount: 76,
        sns: { instagram: "kassis_sound" }
      },
      {
        id: "v2_artist_6",
        name: "Mayshi",
        roleLabel: "DJ",
        genre: "BALEARIC / AMBIENT HOUSE",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        bio: "バレアリックな心地よい波流とアンビエントハウスで極上のリラックス空間を提供。",
        totalPoints: 7200,
        likesCount: 88,
        sns: { instagram: "mayshi_music" }
      },
      {
        id: "v2_artist_1",
        name: "Toru Yamanaka",
        roleLabel: "DJ",
        genre: "EXPERIMENTAL / AMBIENT / TECHNO",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
        bio: "関西シーンを代表するサウンドアーティスト。音と光が共鳴する没入型セットでフロアを魅了する。",
        totalPoints: 12500,
        likesCount: 142,
        sns: { instagram: "toruyamanaka_art" }
      },
      {
        id: "v2_artist_2",
        name: "Jun Takayama aka speedometer.",
        roleLabel: "LIVE / DJ",
        genre: "ELECTRONICA / DOWNTEMPO / DUB",
        stage: "MAIN STAGE",
        time: "LIVE / DJ",
        duration: "SPECIAL",
        image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=600&q=80",
        bio: "speedometer.名義でも世界的に活躍する高山純。極上のエレクトロニカ＆ダブビートでチルアウト空間を創出。",
        totalPoints: 18900,
        likesCount: 230,
        sns: { instagram: "speedometer_juntakayama" }
      },
      {
        id: "v2_artist_3",
        name: "tvvt",
        roleLabel: "DJ",
        genre: "DEEP HOUSE / CHILL TECHNO",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        bio: "7th Gardenのオーガナイズ＆サウンドデザインを手掛ける。ディープで洗練された電子音響空間を構築。",
        totalPoints: 9400,
        likesCount: 110,
        sns: { instagram: "tvvt_7thgarden" }
      },
      {
        id: "v2_artist_7",
        name: "Dune(U.V.)",
        roleLabel: "DJ",
        genre: "EXPERIMENTAL / SOUNDSCAPE",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
        bio: "U.V.所属。深遠なサウンドスケープと立体音響による空間実験を展開。",
        totalPoints: 11200,
        likesCount: 165,
        sns: { instagram: "dune_uv_official" }
      },
      {
        id: "v2_artist_8",
        name: "オギミール（Columbia8)",
        roleLabel: "DJ",
        genre: "SPICE & GROOVE / ALL GENRE",
        stage: "MAIN STAGE",
        time: "DJ SET",
        duration: "DJ",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        bio: "大阪スパイスカレーの名店「Columbia8」創業者オギミール。スパイスの効いた独特のグルーヴ選曲でフロアを魅了する。",
        totalPoints: 15400,
        likesCount: 198,
        sns: { instagram: "columbia8_ogimiel" }
      }
    ]
  }
];

