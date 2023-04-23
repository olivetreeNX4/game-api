// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const Telos = require('telosjs');
const mongoose = require('mongoose');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/game_db', { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define player schema
const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  walletAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create player model
const Player = mongoose.model('Player', playerSchema);

// Define API endpoints
app.post('/players', async (req, res) => {
  const { username } = req.body;

  // Check if player already exists
  const existingPlayer = await Player.findOne({ username });
  if (existingPlayer) {
    return res.status(400).json({ message: 'Player already exists' });
  }

  // Create new wallet address for player
  const privateKey = Telos.modules.ecc.randomKeySync();
  const publicKey = Telos.modules.ecc.privateToPublic(privateKey);
  const walletAddress = Telos.modules.eosjs_ecc
    .publicKeyToLegacyAddress(publicKey, Telos.modules.config.telosTestnet.chainId);

  // Create new player
  const player = new Player({
    username,
    walletAddress
  });

  try {
    await player.save();
    return res.status(201).json(player);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.get('/players', async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    return res.json(players);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/players/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    return res.json(player);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
