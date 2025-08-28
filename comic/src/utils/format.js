export function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export function formatDate(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  }
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  }
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  }
  if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前'
  }
  
  return date.toLocaleDateString('zh-CN')
}

export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}