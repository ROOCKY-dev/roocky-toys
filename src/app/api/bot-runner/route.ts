import { NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

// Global map to store active python processes
const activeBots = new Map<string, ChildProcess>();

export async function POST(request: Request) {
  const body = await request.json();
  const { action, id, token, script } = body;

  if (!id) return new NextResponse('Bot ID required', { status: 400 });

  if (action === 'start') {
    if (!token || !script) return new NextResponse('Token and script required', { status: 400 });
    
    if (activeBots.has(id)) {
      activeBots.get(id)?.kill();
      activeBots.delete(id);
    }

    try {
      const scriptPath = path.join(os.tmpdir(), `bot_${id}.py`);
      await writeFile(scriptPath, script);

      const botProcess = spawn('python3', [scriptPath], {
        env: { ...process.env, DISCORD_TOKEN: token },
        detached: true
      });

      botProcess.stdout.on('data', (data) => console.log(`[Bot ${id}] ${data}`));
      botProcess.stderr.on('data', (data) => console.error(`[Bot ${id} ERR] ${data}`));
      
      botProcess.on('close', async () => {
        activeBots.delete(id);
        try { await unlink(scriptPath); } catch(e) {}
      });

      activeBots.set(id, botProcess);

      // We don't block. Next.js serverless functions might kill background tasks,
      // but if this is running in Dokploy (Next.js standalone Node server), the process survives!
      return NextResponse.json({ success: true, message: 'Bot started successfully' });
    } catch (err: any) {
      return new NextResponse(err.message, { status: 500 });
    }
  }

  if (action === 'stop') {
    const p = activeBots.get(id);
    if (p) {
      p.kill();
      activeBots.delete(id);
    }
    return NextResponse.json({ success: true, message: 'Bot stopped' });
  }

  return new NextResponse('Invalid action', { status: 400 });
}
