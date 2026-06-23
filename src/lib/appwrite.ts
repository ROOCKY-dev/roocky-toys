import { Client, Account, Databases, Storage, ID } from 'appwrite';

export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  dbId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  usersCollId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
  scoresCollId: process.env.NEXT_PUBLIC_APPWRITE_SCORES_COLLECTION_ID || '',
  lobbiesCollId: process.env.NEXT_PUBLIC_APPWRITE_LOBBIES_COLLECTION_ID || '',
  linksCollId: process.env.NEXT_PUBLIC_APPWRITE_LINKS_COLLECTION_ID || '',
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || ''
};

export const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };
