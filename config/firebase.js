const { Storage } = require('@google-cloud/storage')

const PROJECT_ID = 'vitagist-consumer-docu' 
const KEY = './serviceAccountKey.json' 

exports.getStorageClient = ()=>{
    return new Storage({
      projectId: PROJECT_ID,
      keyFilename: KEY
    })
}