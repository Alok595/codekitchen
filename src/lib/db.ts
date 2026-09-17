import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-jobtracker';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  // If the URI specifies a database (e.g. Atlas /aijobtracker), client.db() automatically selects it.
  // Otherwise, fallback to 'aijobtracker'.
  return client.db(process.env.MONGODB_DB_NAME || undefined);
}
