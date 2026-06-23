const sdk = require('node-appwrite');

const client = new sdk.Client();
client
    .setEndpoint('https://appwrite.roocky.dev/v1') // Your API Endpoint
    .setProject('6a3a90f3003320c632ec') // Your project ID
    .setKey('standard_2ceb5c13f515fcdcb41d5f6fd8e31ff39db0f2e871c9419c5c20826be5cc7ceed7910da30f383ba542c98c65390d0ff1633a7423cc6b54270f468f53a235f2a05c5a70db0c531589d7e5c7a731cd937fc6b44387e0ef5230b07890f3db3c8a6b18a3b309095052a3eb2ebe645742ebadeb3acf26822da52cf0e342b0108f4545');

const databases = new sdk.Databases(client);
databases.list().then(res => {
    console.log("Databases:", res);
}).catch(err => {
    console.error("Error:", err);
});
