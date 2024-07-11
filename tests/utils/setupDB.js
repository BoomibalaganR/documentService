const mongoose = require('mongoose')

exports.connectDB = async () => {
	await mongoose.connection.close()
	await mongoose.connect(
		'mongodb+srv://boomibalaganR:Boomi1234@cluster0.ue0af0l.mongodb.net/test-db?retryWrites=true&w=majority&appName=Cluster0'
	)
}

exports.clearDB = async () => {
	const collections = await mongoose.connection.db.collections()

	for (let collection of collections) {
		await collection.deleteMany({})
	}
}
