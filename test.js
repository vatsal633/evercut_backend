import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = "mongodb+srv://UjjwalSharma:1234@cluster0.gliwh6s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  try {
    const client = new MongoClient(uri);
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connection is valid and live");
    await client.close();
  } catch (error) {
    console.log("Connection failed:", error.message);
  }
}

testConnection();
