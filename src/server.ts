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
app.use(express.json());

app.get('/api/characters/', async (_request, response) => {
  const characterCollection = getCharacterCollection();
  const characters = characterCollection.find();
  const allCharacters = await characters.toArray();
  response.send(allCharacters);
});

app.post('/api/characters', async (request, response) => {
  const characterCollection = getCharacterCollection();
  const newCharacter = request.body;

  if (
    typeof newCharacter.name !== 'string' ||
    // typeof newCharacter.house !== 'string' ||
    typeof newCharacter.dateOfBirth !== 'string'
  ) {
    response.status(404).send('Missing properties');
  }
  const isCharacterKnown = await characterCollection.findOne({
    name: newCharacter.name,
  });
  if (isCharacterKnown) {
    response
      .status(409)
      .send(`There is already someone called ${newCharacter.name}`);
  } else {
    characterCollection.insertOne(newCharacter);
    response.send(`${newCharacter.name} was added`);
  }
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
