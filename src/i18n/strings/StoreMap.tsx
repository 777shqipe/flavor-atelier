import { defineStrings } from "..";

export const storeMapStrings = defineStrings({
  en: {
    mapLabel: "Map of the four Cheaper Buy Miles stores in inner Melbourne",
    /** A shopfront pin's name: its tooltip and accessible name. */
    pinTitle: (name: string) => `${name} store`,
    /** The pin for where you are. */
    you: "You",
    /** Map captions, keyed by the landmark ids in mapArt.ts. */
    landmarks: {
      cbd: "CBD",
      qvm: "Queen Vic Market",
      zoo: "Melbourne Zoo",
      cup: "Flemington Racecourse",
      star: "Melbourne Star",
      reb: "Exhibition Building",
      park: "Royal Park",
    },
    /** The compass's north. */
    north: "N",
    findNearest: "Find my nearest",
    locating: "Locating…",
    mapUnavailable: "The map couldn’t load. Store details are still available below.",
    retry: "Try again",
    nearest: (name: string, km: string) => (
      <>
        Nearest: <b>{name}</b> · {km} away
      </>
    ),
    locateError: {
      unsupported: "Location isn’t available in this browser.",
      denied: "Location permission was declined.",
      failed: "Couldn’t work out where you are.",
    },
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    showAll: "Show all stores",
    all: "All",
  },
  vi: {
    mapLabel: "Bản đồ bốn cửa hàng Cheaper Buy Miles ở nội thành Melbourne",
    pinTitle: (name) => `Cửa hàng ${name}`,
    you: "Bạn",
    landmarks: {
      cbd: "Trung tâm",
      qvm: "Chợ Queen Victoria",
      zoo: "Sở thú Melbourne",
      cup: "Trường đua Flemington",
      star: "Melbourne Star",
      reb: "Tòa nhà Triển lãm",
      park: "Công viên Royal",
    },
    north: "B",
    findNearest: "Tìm cửa hàng gần nhất",
    locating: "Đang định vị…",
    mapUnavailable: "Không tải được bản đồ. Thông tin cửa hàng vẫn có ở bên dưới.",
    retry: "Thử lại",
    nearest: (name, km) => (
      <>
        Gần nhất: <b>{name}</b> · cách {km}
      </>
    ),
    locateError: {
      unsupported: "Trình duyệt này không hỗ trợ định vị.",
      denied: "Bạn đã từ chối quyền truy cập vị trí.",
      failed: "Không xác định được vị trí của bạn.",
    },
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    showAll: "Hiện tất cả cửa hàng",
    all: "Tất cả",
  },
  zh: {
    mapLabel: "墨尔本市区 Cheaper Buy Miles 四家门店地图",
    pinTitle: (name) => `${name} 门店`,
    you: "你",
    landmarks: {
      cbd: "市中心",
      qvm: "维多利亚女王市场",
      zoo: "墨尔本动物园",
      cup: "弗莱明顿赛马场",
      star: "墨尔本之星",
      reb: "皇家展览馆",
      park: "皇家公园",
    },
    north: "北",
    findNearest: "找最近的门店",
    locating: "定位中……",
    mapUnavailable: "地图暂时无法加载，下方仍可查看门店信息。",
    retry: "重试",
    nearest: (name, km) => (
      <>
        最近的门店：<b>{name}</b> · 距你 {km}
      </>
    ),
    locateError: {
      unsupported: "此浏览器不支持定位。",
      denied: "未获得定位权限。",
      failed: "无法确定你的位置。",
    },
    zoomIn: "放大",
    zoomOut: "缩小",
    showAll: "显示全部门店",
    all: "全部",
  },
  it: {
    mapLabel: "Mappa dei quattro negozi Cheaper Buy Miles nel cuore di Melbourne",
    pinTitle: (name) => `Negozio ${name}`,
    you: "Tu",
    landmarks: {
      cbd: "Centro",
      qvm: "Mercato Queen Victoria",
      zoo: "Zoo di Melbourne",
      cup: "Ippodromo di Flemington",
      star: "Melbourne Star",
      reb: "Palazzo delle Esposizioni",
      park: "Royal Park",
    },
    north: "N",
    findNearest: "Trova il più vicino",
    locating: "Ti sto localizzando…",
    mapUnavailable: "La mappa non si è caricata. I dettagli dei negozi restano disponibili qui sotto.",
    retry: "Riprova",
    nearest: (name, km) => (
      <>
        Il più vicino: <b>{name}</b> · a {km}
      </>
    ),
    locateError: {
      unsupported: "Questo browser non supporta la localizzazione.",
      denied: "Hai negato l’accesso alla posizione.",
      failed: "Non riusciamo a capire dove sei.",
    },
    zoomIn: "Ingrandisci",
    zoomOut: "Riduci",
    showAll: "Mostra tutti i negozi",
    all: "Tutti",
  },
  ja: {
    mapLabel: "メルボルン市内にあるCheaper Buy Milesの4店舗の地図",
    pinTitle: (name) => `${name}店`,
    you: "現在地",
    landmarks: {
      cbd: "シティ",
      qvm: "ヴィクトリア・マーケット",
      zoo: "メルボルン動物園",
      cup: "フレミントン競馬場",
      star: "メルボルン・スター",
      reb: "王立展示館",
      park: "ロイヤル・パーク",
    },
    north: "北",
    findNearest: "最寄りの店舗を探す",
    locating: "現在地を確認中…",
    mapUnavailable: "地図を読み込めませんでした。下の店舗情報は引き続きご覧いただけます。",
    retry: "再試行",
    nearest: (name, km) => (
      <>
        最寄り：<b>{name}</b> · {km}先
      </>
    ),
    locateError: {
      unsupported: "このブラウザでは位置情報が使えません。",
      denied: "位置情報の利用が許可されませんでした。",
      failed: "現在地を特定できませんでした。",
    },
    zoomIn: "拡大",
    zoomOut: "縮小",
    showAll: "全店舗を表示",
    all: "すべて",
  },
});
