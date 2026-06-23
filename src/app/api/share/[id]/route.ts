import { NextResponse } from 'next/server';
import { Client, Databases, Storage } from 'node-appwrite';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) return new NextResponse('ID is required', { status: 400 });

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
  const apiKey = process.env.APPWRITE_API_KEY || ''; // Optional, if public access is allowed we don't strictly need it

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
    
  if (apiKey) client.setKey(apiKey);

  const databases = new Databases(client);

  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
    const collId = process.env.NEXT_PUBLIC_APPWRITE_LINKS_COLLECTION_ID || '';

    // Fetch link data
    const linkDoc = await databases.getDocument(dbId, collId, id);

    // Check expiration
    if (linkDoc.expiresAt && new Date(linkDoc.expiresAt) < new Date()) {
      return new NextResponse('This file link has expired.', { status: 410 });
    }

    // Increment clicks
    await databases.updateDocument(dbId, collId, id, {
      clicks: (linkDoc.clicks || 0) + 1
    });

    // Redirect to the actual file URL
    return NextResponse.redirect(linkDoc.url);

  } catch (error: any) {
    console.error('Share Link Error:', error);
    return new NextResponse('File not found or an error occurred.', { status: 404 });
  }
}
