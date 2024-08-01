const { Storage } = require('@google-cloud/storage')
// require('../serviceAccountKey.json')
const PROJECT_ID = 'vitagist-consumer-docu'
// const KEY = '../serviceAccountKey.json'
const KEY = path.resolve(__dirname, '../serviceAccountKey.json')
console.log('====<<>', KEY)
exports.getStorageClient = () => {
	return new Storage({
		projectId: PROJECT_ID,
		keyFilename: KEY
	})
}
