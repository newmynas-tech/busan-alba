export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Vercel 환경변수에서 키를 가져옵니다.
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  if (!apiKey || !cx) {
    return res.status(500).json({ error: '서버 환경변수가 설정되지 않았습니다.' });
  }

  const { keyword } = req.body;
  const query = `부산 ${keyword} 알바 구인`;

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10&lr=lang_ko`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'Google API 오류');

    const jobs = (data.items || []).map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      platform: item.link.includes('albamon') ? '알바몬' : 
                item.link.includes('alba.co.kr') ? '알바천국' : 
                item.link.includes('daangn') ? '당근마켓' : '기타'
    }));

    return res.status(200).json({ jobs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
