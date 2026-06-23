import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const type = searchParams.get('type') || 'video';

  if (!url) return new NextResponse('URL is required', { status: 400 });

  try {
    const formatArg = type === 'audio' ? 'bestaudio/best' : 'best';
    const { stdout } = await execAsync(`yt-dlp -f "${formatArg}" -g --no-warnings --add-header "referer:youtube.com" --add-header "user-agent:Mozilla/5.0" "${url.replace(/"/g, '\\"')}"`);
    const directUrl = stdout.trim();

    if (!directUrl) throw new Error("No URL extracted");

    return NextResponse.redirect(directUrl);
  } catch (error) {
    console.error('YT Download Error:', error);
    return new NextResponse('Failed to generate download link', { status: 500 });
  }
}
