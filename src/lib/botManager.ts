import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Global cache to persist across hot reloads in dev, but mostly for prod state
const globalAny: any = global;
if (!globalAny.botProcesses) {
    globalAny.botProcesses = new Map<string, ChildProcess>();
}
const botProcesses: Map<string, ChildProcess> = globalAny.botProcesses;

export async function startBot(id: string, token: string, code: string): Promise<boolean> {
    if (botProcesses.has(id)) {
        stopBot(id);
    }

    const tmpDir = path.join(os.tmpdir(), 'discord-bots');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const scriptPath = path.join(tmpDir, `${id}.js`);
    
    // Inject token securely into the script
    const injectedCode = `
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
${code}
client.login('${token}').catch(console.error);
    `;

    fs.writeFileSync(scriptPath, injectedCode);

    const child = spawn('node', [scriptPath], {
        detached: false,
        stdio: 'ignore'
    });

    botProcesses.set(id, child);

    child.on('exit', () => {
        botProcesses.delete(id);
        if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
    });

    return true;
}

export function stopBot(id: string): boolean {
    const child = botProcesses.get(id);
    if (child) {
        child.kill();
        botProcesses.delete(id);
        return true;
    }
    return false;
}

export function getBotStatus(id: string): boolean {
    return botProcesses.has(id);
}
