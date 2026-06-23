const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('https://appwrite.roocky.dev/v1')
    .setProject('6a3a90f3003320c632ec')
    .setKey('standard_2ceb5c13f515fcdcb41d5f6fd8e31ff39db0f2e871c9419c5c20826be5cc7ceed7910da30f383ba542c98c65390d0ff1633a7423cc6b54270f468f53a235f2a05c5a70db0c531589d7e5c7a731cd937fc6b44387e0ef5230b07890f3db3c8a6b18a3b309095052a3eb2ebe645742ebadeb3acf26822da52cf0e342b0108f4545');

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);
const dbId = '6a3a94540008e02ed643';

async function setup() {
    try {
        console.log("Setting up Appwrite DropShareLinks Collection...");
        const linksColl = await databases.createCollection(
            dbId, 
            sdk.ID.unique(), 
            'DropShareLinks',
            [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
        );
        console.log("Created DropShareLinks Collection:", linksColl.$id);

        await databases.createStringAttribute(dbId, linksColl.$id, 'fileId', 100, true);
        await new Promise(r => setTimeout(r, 2000));
        await databases.createStringAttribute(dbId, linksColl.$id, 'fileName', 255, true);
        await new Promise(r => setTimeout(r, 2000));
        await databases.createIntegerAttribute(dbId, linksColl.$id, 'fileSize', true);
        await new Promise(r => setTimeout(r, 2000));
        await databases.createStringAttribute(dbId, linksColl.$id, 'url', 1000, true);
        await new Promise(r => setTimeout(r, 2000));
        await databases.createStringAttribute(dbId, linksColl.$id, 'expiresAt', 100, false);
        await new Promise(r => setTimeout(r, 2000));
        await databases.createIntegerAttribute(dbId, linksColl.$id, 'clicks', true, 0);
        await new Promise(r => setTimeout(r, 2000));
        await databases.createStringAttribute(dbId, linksColl.$id, 'createdAt', 100, true);
        await new Promise(r => setTimeout(r, 2000));

        console.log("DropShareLinks setup complete.");
    } catch(err) {
        console.error("Error setting up:", err.message);
    }
}

setup();
