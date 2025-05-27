export function getTopDevicesByClickCount(devices) {
  const clickKey = "device_click_count";
  let clickMap = {};
  try {
    clickMap = JSON.parse(localStorage.getItem(clickKey)) || {};
  } catch (e) {
    clickMap = {};
  }
  const sorted = [...devices].sort((a, b) => {
    const ca = clickMap[a.id] || 0;
    const cb = clickMap[b.id] || 0;
    return cb - ca;
  });
  return sorted.slice(0, 4);
}
