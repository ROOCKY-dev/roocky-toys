import { NextResponse } from 'next/server';
import { startBot, stopBot, getBotStatus } from '@/lib/botManager';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, id, token, code } = body;

        if (!id) return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });

        if (action === 'start') {
            if (!token || !code) return NextResponse.json({ error: 'Token and Code are required' }, { status: 400 });
            await startBot(id, token, code);
            return NextResponse.json({ success: true, status: 'running' });
        } 
        else if (action === 'stop') {
            stopBot(id);
            return NextResponse.json({ success: true, status: 'stopped' });
        }
        else if (action === 'status') {
            return NextResponse.json({ success: true, status: getBotStatus(id) ? 'running' : 'stopped' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
