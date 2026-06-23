import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const { stdout } = await execAsync(`yt-dlp -J --no-warnings --add-header "referer:youtube.com" --add-header "user-agent:Mozilla/5.0" "${url.replace(/"/g, '\\"')}"`);
    const videoInfo = JSON.parse(stdout);

    return NextResponse.json({
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: new Date((videoInfo.duration || 0) * 1000).toISOString().substr(11, 8).replace(/^00:/, ''),
      channel: videoInfo.uploader || 'Unknown Channel',
    });
  } catch (error: any) {
    console.error('YT Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch video. Ensure the link is correct and public.' }, { status: 500 });
  }
}
