import { Request, Response } from 'express';

function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = match[1] ? parseInt(match[1], 10) : 0;
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const s = match[3] ? parseInt(match[3], 10) : 0;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const getOembed = async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ message: 'URL diperlukan' });
    }

    const isYoutube =
      url.includes('youtube.com/watch') || url.includes('youtu.be/');
    if (!isYoutube) {
      return res.json({});
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const oembedRes = await fetch(oembedUrl);
    if (!oembedRes.ok) {
      return res.json({});
    }
    const oembedData = (await oembedRes.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };

    let duration = '';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const pageRes = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const html = await pageRes.text();
      const durMatch = html.match(/itemprop="duration"\s+content="([^"]+)"/);
      if (durMatch?.[1]) {
        duration = parseIsoDuration(durMatch[1]);
      }
    } catch {
      // Duration is optional
    }

    return res.json({
      title: oembedData.title || '',
      author_name: oembedData.author_name || '',
      thumbnail_url: oembedData.thumbnail_url || '',
      duration,
    });
  } catch (error) {
    console.error('[OEMBED-ERROR]', error);
    return res.json({});
  }
};
