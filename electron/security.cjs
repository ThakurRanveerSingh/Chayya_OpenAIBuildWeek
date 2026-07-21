function bingSearchUrl(query) {
  const text = String(query || '').trim();
  if (!text || text.length > 180 || /[\u0000-\u001f]/.test(text)) throw new Error('Enter a short, plain-text research query.');
  return `https://www.bing.com/search?q=${encodeURIComponent(text)}`;
}

module.exports = { bingSearchUrl };
