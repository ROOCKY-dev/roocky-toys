import { NextResponse } from 'next/server';
import play from 'play-dl';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const videoInfo = await play.video_info(url);
    const details = videoInfo.video_details;

    return NextResponse.json({
      title: details.title,
      thumbnail: details.thumbnails?.[details.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${details.id}/maxresdefault.jpg`,
      duration: details.durationRaw,
      channel: details.channel?.name || 'Unknown Channel',
    });
  } catch (error: any) {
    console.error('YT Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch video information. It might be age-restricted or unavailable.' }, { status: 500 });
  }
}
