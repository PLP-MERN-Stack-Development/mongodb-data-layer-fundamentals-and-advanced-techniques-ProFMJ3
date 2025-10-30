// queries.js - MongoDB queries for Week 1 Assignment

const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const books = db.collection('books');

    console.log('\n--- Tâche 2 : CRUD de base ---');

  

    // 1️ Trouver tous les livres d'un genre spécifique
    console.log('\nLivres de genre "Fiction":');
    console.log(await books.find({ genre: 'Fiction' }).toArray());

    // 2️ Trouver des livres publiés après une certaine année
    console.log('\nLivres publiés après 1950:');
    console.log(await books.find({ published_year: { $gt: 1950 } }).toArray());

    // 3️ Trouver des livres d'un auteur spécifique
    console.log('\nLivres de George Orwell:');
    console.log(await books.find({ author: 'George Orwell' }).toArray());

    // 4️ Mettre à jour le prix d'un livre spécifique
    await books.updateOne(
      { title: '1984' },
      { $set: { price: 12.50 } }
    );
    console.log('\nPrix de "1984" mis à jour.');

    // 5️ Supprimer un livre par son titre
    await books.deleteOne({ title: 'Moby Dick' });
    console.log('\n"Moby Dick" supprimé de la collection.');

    console.log('\n--- Tâche 3 : Requêtes avancées ---');

    // 6️ Livres en stock et publiés après 2010
    console.log('\nLivres en stock et publiés après 2010:');
    console.log(await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray());

    // 7️ Projection : titre, auteur, prix
    console.log('\nProjection (title, author, price) :');
    console.log(await books.find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray());

    // 8️ Tri par prix croissant
    console.log('\nLivres triés par prix croissant:');
    console.log(await books.find().sort({ price: 1 }).toArray());

    // 9️ Tri par prix décroissant
    console.log('\nLivres triés par prix décroissant:');
    console.log(await books.find().sort({ price: -1 }).toArray());

    //  Pagination : 5 livres par page
    console.log('\nPage 1 (5 livres) :');
    console.log(await books.find().skip(0).limit(5).toArray());
    console.log('\nPage 2 (5 livres) :');
    console.log(await books.find().skip(5).limit(5).toArray());

    console.log('\n--- Tâche 4 : Pipeline d\'agrégation ---');

    // 11️ Prix moyen par genre
    console.log('\nPrix moyen par genre :');
    console.log(await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray());

    // 12️ Auteur avec le plus de livres
    console.log('\nAuteur avec le plus de livres :');
    console.log(await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray());

    // 13️ Regrouper les livres par décennie de publication
    console.log('\nNombre de livres par décennie :');
    console.log(await books.aggregate([
      {
        $group: {
          _id: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray());

    console.log('\n--- Tâche 5 : Indexation ---');

    // 14️ Créer un index sur le titre
    await books.createIndex({ title: 1 });
    console.log('Index créé sur le champ title.');

    // 15️ Créer un index composite sur auteur et année de publication
    await books.createIndex({ author: 1, published_year: -1 });
    console.log('Index composite créé sur author et published_year.');

    // 16️ Vérifier l'amélioration des performances avec explain()
    console.log('\nExplain de la requête sur title "1984" :');
    console.log(await books.find({ title: '1984' }).explain("executionStats"));

  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    await client.close();
    console.log('Connexion fermée.');
  }
}

// Exécuter le script
runQueries();
