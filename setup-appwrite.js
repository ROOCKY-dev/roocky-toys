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
// Lobbies already created
        console.log("Setting up DropShare Storage Bucket...");
        const bucket = await storage.createBucket(
            sdk.ID.unique(),
            'DropShare',
            [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())],
            true, // fileSecurity
            true, // enabled
            30000000 // 30MB max
        );
        console.log("Created Storage Bucket:", bucket.$id);

    } catch(err) {
        console.error("Error setting up:", err.message);
    }
}

setup();
