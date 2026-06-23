import { NextResponse } from 'next/server';
import play from 'play-dl';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'video'; // 'video' or 'audio'

  if (!url) {
    return new NextResponse('URL is required', { status: 400 });
  }

  try {
    const videoInfo = await play.video_info(url);
    const title = videoInfo.video_details.title?.replace(/[^a-zA-Z0-9 -]/g, '') || 'download';
    
    // Choose quality based on format
    const quality = format === 'audio' ? 2 : 1; 
    const streamInfo = await play.stream_from_info(videoInfo, { quality });

    // Format headers
    const headers = new Headers();
    const ext = format === 'audio' ? 'mp3' : 'mp4';
    headers.set('Content-Disposition', `attachment; filename="${title}.${ext}"`);
    headers.set('Content-Type', format === 'audio' ? 'audio/mpeg' : 'video/mp4');

    // Convert play-dl stream to standard Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        streamInfo.stream.on('data', (chunk) => controller.enqueue(chunk));
        streamInfo.stream.on('end', () => controller.close());
        streamInfo.stream.on('error', (err) => controller.error(err));
      },
      cancel() {
        streamInfo.stream.destroy();
      }
    });

    return new NextResponse(readableStream as any, { headers });
  } catch (error: any) {
    console.error('YT Download Error:', error);
    return new NextResponse('Failed to download video stream. ' + error.message, { status: 500 });
  }
}
