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

// Display all characters
app.get('/api/characters/', async (_request, response) => {
  const characterCollection = getCharacterCollection();
  const characters = characterCollection.find();
  const allCharacters = await characters.toArray();
  response.send(allCharacters);
});

// Add new character
app.post('/api/characters', async (request, response) => {
  const characterCollection = getCharacterCollection();
  const newCharacter = request.body;

  if (typeof newCharacter.name !== 'string') {
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

// Delete character
app.delete('/api/characters/:name', async (request, response) => {
  const characterCollection = getCharacterCollection();
  const character = request.params.name;
  const characterRequest = await characterCollection.findOne({
    name: character,
  });
  if (!characterRequest) {
    response.status(404).send('User not found.');
  } else {
    characterCollection.deleteOne(characterRequest);
    response.send(`${character} was deleted.`);
  }
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
