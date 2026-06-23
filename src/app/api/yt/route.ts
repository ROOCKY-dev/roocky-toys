import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const videoInfo: any = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
    });

    return NextResponse.json({
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: new Date(videoInfo.duration * 1000).toISOString().substr(11, 8).replace(/^00:/, ''),
      channel: videoInfo.uploader || 'Unknown Channel',
    });
  } catch (error: any) {
    console.error('YT Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch video. Ensure the link is correct and public.' }, { status: 500 });
  }
}
