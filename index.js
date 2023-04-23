import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3000;
const telosEndpoint = 'https://api.telos.kitchen';

// Players must sign up on Telos before he/she can play the game
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await fetch(`${telosEndpoint}/v1/chain/get_account`, {
      method: 'POST',
      body: JSON.stringify({ account_name: username }),
    });
    const userExists = response.ok;
    if (userExists) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }
    // Register the user on Telos
    await fetch(`${telosEndpoint}/v1/chain/newaccount`, {
      method: 'POST',
      body: JSON.stringify({
        creator: 'eosio',
        name: username,
        owner: {
          threshold: 1,
          keys: [{ key: password, weight: 1 }],
          accounts: [],
          waits: [],
        },
        active: {
          threshold: 1,
          keys: [{ key: password, weight: 1 }],
          accounts: [],
          waits: [],
        },
      }),
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Player can buy NFTs on AreaX
app.post('/buyNFT', async (req, res) => {
  try {
    const { username, password, nftId, quantity } = req.body;
    // Authenticate the user on Telos
    const response = await fetch(`${telosEndpoint}/v1/chain/get_account`, {
      method: 'POST',
      body: JSON.stringify({ account_name: username }),
    });
    const authenticated = response.ok;
    if (!authenticated) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    // Buy the NFT on AreaX
    const areaXEndpoint = 'https://areax.example.com';
    const nftPrice = 10; // price in TLOS
    const totalPrice = nftPrice * quantity;
    const areaXResponse = await fetch(`${areaXEndpoint}/buyNFT`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        nftId,
        quantity,
        totalPrice,
      }),
    });
    if (!areaXResponse.ok) {
      res.status(400).json({ error: 'Failed to buy NFT' });
      return;
    }
    res.status(200).json({ message: 'NFT bought successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// The diamonds represent 2000 points each
// Points can be used to buy Nitro 
// Only First level is free
const diamondsValue = 2000;
const nitroPrice = 100; // price in TLOS

app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find({});
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/cars', async (req, res) => {
  try {
    const { name, price, type } = req.body;
    const car = new Car({
      name,
      price,
      type,
    });
    await car.save();
    res.status(201).json({ message: 'Car created successfully', car });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/car/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/car/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, type } = req.body;
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    car.name = name;
    car.price = price;
    car.type = type;
    await car.save();
    res.json({ message: 'Car updated successfully', car });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/car/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    await car.delete();
    res.json({ message: 'Car deleted successfully', car });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

