import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'video'; 

  if (!url) {
    return new NextResponse('URL is required', { status: 400 });
  }

  try {
    const formatFilter = format === 'audio' ? 'bestaudio' : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
    
    const videoInfo: any = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      format: formatFilter,
      addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
    });

    const directUrl = videoInfo.url || (videoInfo.formats && videoInfo.formats.find((f: any) => f.url)?.url);

    if (directUrl) {
      return NextResponse.redirect(directUrl);
    }

    return new NextResponse('Could not extract direct stream URL.', { status: 500 });
  } catch (error: any) {
    console.error('YT Download Error:', error);
    return new NextResponse('Failed to process video stream. ' + error.message, { status: 500 });
  }
}
