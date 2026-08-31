const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ablakemail:SXowhEq84uRCM57p@cluster0.jbj1yjb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'ai_list';
const COLLECTION = 'items';
let db, itemsCollection;

MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(DB_NAME);
    itemsCollection = db.collection(COLLECTION);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Edit (update) item by id
app.put('/items/:id', async (req, res) => {
  const id = req.params.id;
  const updatedFields = req.body;
  try {
    const result = await itemsCollection.findOneAndUpdate(
      { id: id },
      { $set: { ...updatedFields, id: id } },
      { returnDocument: 'after' }
    );
    // if (!result.value) {
    //   return res.status(404).json({ error: 'Item not found' });
    // }
    res.json(result.value);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all items
app.get('/items', async (req, res) => {
  try {
    const items = await itemsCollection.find({}).toArray();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new item
app.post('/items', async (req, res) => {
  const newItem = req.body;
  try {
    await itemsCollection.insertOne(newItem);
    res.status(201).json(newItem);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete item by id
app.delete('/items/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await itemsCollection.deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Export all items as a downloadable JSON file
app.get('/export', async (req, res) => {
  try {
    const items = await itemsCollection.find({}).toArray();
    res.setHeader('Content-Disposition', 'attachment; filename="ai_list_export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(items, null, 2));
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Import items from uploaded JSON
app.post('/import', async (req, res) => {
  const importedItems = req.body;
  if (!Array.isArray(importedItems)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
  }
  try {
    await itemsCollection.deleteMany({});
    await itemsCollection.insertMany(importedItems);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// const express = require('express');
// const { MongoClient } = require('mongodb');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Локальный URI без пароля
// const MONGO_URI = 'mongodb://127.0.0.1:27017';
// const DB_NAME = 'ai_list';
// const COLLECTION = 'items';
// let db, itemsCollection;

// app.use(cors());
// app.use(express.json());

// // Раздача статических файлов фронтенда (если вы положите их в папку 'public')
// app.use(express.static(path.join(__dirname, 'public')));
// console.log('📂 Раздача статических файлов из папки:', path.join(__dirname, 'public')); // <-- ДОБАВИТЬ ЭТО

// MongoClient.connect(MONGO_URI)
//   .then(client => {
//     db = client.db(DB_NAME);
//     itemsCollection = db.collection(COLLECTION);
//     console.log('✅ Успешно подключено к локальной MongoDB');
//   })
//   .catch(err => {
//     console.error('❌ Ошибка подключения к MongoDB:', err);
//     process.exit(1);
//   });

// // --- Ваши CRUD маршруты (без изменений, они корректны) ---
// app.put('/items/:id', async (req, res) => {
//   const id = req.params.id;
//   const updatedFields = req.body;
//   try {
//     const result = await itemsCollection.findOneAndUpdate(
//       { id: id },
//       { $set: { ...updatedFields, id: id } },
//       { returnDocument: 'after' }
//     );
//     res.json(result.value);
//   } catch (e) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// app.get('/items', async (req, res) => {
//   try {
//     const items = await itemsCollection.find({}).toArray();
//     res.json(items);
//   } catch (e) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// app.post('/items', async (req, res) => {
//   const newItem = req.body;
//   try {
//     await itemsCollection.insertOne(newItem);
//     res.status(201).json(newItem);
//   } catch (e) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// app.delete('/items/:id', async (req, res) => {
//   const id = req.params.id;
//   try {
//     const result = await itemsCollection.deleteOne({ id: id });
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: 'Item not found' });
//     }
//     res.json({ success: true });
//   } catch (e) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// app.get('/export', async (req, res) => {
//   try {
//     const items = await itemsCollection.find({}).toArray();
//     res.setHeader('Content-Disposition', 'attachment; filename="ai_list_export.json"');
//     res.setHeader('Content-Type', 'application/json');
//     res.send(JSON.stringify(items, null, 2));
//   } catch (e) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// app.post('/import', async (req, res) => {
//   const importedItems = req.body;
//   if (!Array.isArray(importedItems)) {
//     return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
//   }
//   try {
//     await itemsCollection.deleteMany({});
//     await itemsCollection.insertMany(importedItems);
//     res.json({ success: true });
//   } catch (e) {
//     res.status(500).json({ error: 'Database error' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
// });