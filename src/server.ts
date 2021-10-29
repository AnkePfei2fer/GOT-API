import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDatabase } from './utils/database';
import { getCharacterCollection } from './utils/database';

if (!process.env.MONGODB_URI) {
  throw new Error('No MongoDB URI dotenv variable');
}

const app = express();
const port = 3000;

app.get('/api/characters/', async (_request, response) => {
  const charactersCollection = getCharacterCollection();
  const characters = charactersCollection.find();
  const allCharacters = await characters.toArray();
  response.send(allCharacters);
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
