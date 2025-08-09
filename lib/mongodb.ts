import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.warn('MONGODB_URI not set; analytics/auth will be disabled until set')
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

export const getMongoClient = () => {
  if (!uri) throw new Error('MONGODB_URI not set')
  if (!clientPromise) {
    client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export const getDb = async () => {
  const cli = await getMongoClient()
  const dbName = process.env.MONGODB_DB || 'prompt'
  return cli.db(dbName)
}
