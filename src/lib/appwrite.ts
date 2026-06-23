import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();

if (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && 
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
} else {
  // Graceful fallback for local dev when vars aren't set
  client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('dummy-project');
}

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };

export const APPWRITE_CONFIG = {
  dbId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'dummy-db',
  usersCollId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'dummy-users',
  scoresCollId: process.env.NEXT_PUBLIC_APPWRITE_SCORES_COLLECTION_ID || 'dummy-scores',
};
