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
    locating: "定位中…",
    nearest: (name, km) => (
      <>
        最近：<b>{name}</b> · 相距 {km}
      </>
    ),
    locateError: {
      unsupported: "此浏览器不支持定位。",
      denied: "你拒绝了定位权限。",
      failed: "无法确定你的位置。",
    },
    zoomIn: "放大",
    zoomOut: "缩小",
    showAll: "显示全部门店",
    all: "全部",
  },
});
