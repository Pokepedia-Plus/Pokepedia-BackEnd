require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
// const AuthRouter = require("./routes/router");

//middleware
app.use(cors());
app.use(express.json());

//Routes
// app.use(AuthRouter);
app.get("/", (req, res) => {
  res.send("hello").status(200);
});
app.get("/pokemons", async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT name FROM pokemon ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching Pokemon data from database.');
  }
});

app.get("/pokemonsData", async (req, res) => {
  const name = req.query.name;

  if (!name) {
    return res.status(400).send("Missing search term");
  }

  try {
    const query = {
      text: "SELECT * FROM pokemon WHERE name = $1",
      values: [name],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).send("Pokemon not found");
    }

    const pokemon = result.rows[0];

    let newS = pokemon.stats.replace(/{|}|"/g, "");
    let SList = newS.split(",");
    const jsonS = JSON.stringify(SList).replace(/\\\\/g, "");
    const resultS = JSON.parse(jsonS);

    let newM = pokemon.moves.replace(/{|}|"/g, "");
    let MList = newM.split(",");
    const jsonM = JSON.stringify(MList).replace(/\\\\/g, "");
    const resultM = JSON.parse(jsonM);

    let newT = pokemon.types.replace(/{|}|"/g, "");
    let TList = newT.split(",");

    let stats = [];
    for (let i = 0; i < resultS.length; i += 2) {
      const name = resultS[i].split(":")[1];
      const base_stat = resultS[i + 1].split(":")[1];
      stats.push({ name, base_stat });
    }

    const formattedPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      types: TList,
      back_sprite: pokemon.back_sprite,
      dreamworld_sprite: pokemon.dreamworld_sprite,
      frontSprite: pokemon.front_sprite,
      height: pokemon.height,
      pokemonId: pokemon.id,
      moves: resultM,
      weight: pokemon.weight,
      stats: stats,
    };

    res.json(formattedPokemon);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching Pokemon data from database.");
  }
});




app.get("/insertPokemon", async (req, res) => {
  try {
fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
.then(res => res.json())
.then(data => {
  for (let pokemon of data.results) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
    .then((res) => res.json())
      .then((data) => {
        let name, pokemon_id, types, height, moves, front_sprite, back_sprite, dreamworld_sprite,stats,weight
        pokemon_id = data.id
        name = pokemon.name
        dreamworld_sprite = data.sprites.other.dream_world.front_default
        height = data.height
        moves = data.moves.map((move) => move.move.name)
        front_sprite = data.sprites.front_default;
        back_sprite = data.sprites.back_default;
        stats = data.stats.map((stat) => ({ name: stat.stat.name, base_stat: stat.base_stat }))
        types = data.types.map((type) => type.type.name)
        weight = data.weight
        sendingThePokemon(pokemon_id,name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight)
      });
    }
})

    res.status(200).send('Successfully inserted Pokemon names to the database.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting Pokemon names into the database.');
  }
}); 

async function sendingThePokemon(pokemon_id,name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight){
  await pool.query('INSERT INTO pokemon (pokemon_id, name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [pokemon_id,name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight]);
}

pool.query(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id SERIAL PRIMARY KEY,
    pokemon_id INTEGER UNIQUE,
    name VARCHAR(255),
    abilities VARCHAR(255),
    types VARCHAR(255),
    appearances VARCHAR(255),
    height FLOAT,
    moves VARCHAR(5000),
    front_sprite VARCHAR(255),
    back_sprite VARCHAR(255),
    dreamworld_sprite VARCHAR(255),
    stats VARCHAR(2000),
    weight FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`, (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Table created successfully');
  }
  pool.end();
});


const port =   process.env.PORT || 4000;
app.listen(port, () => {
  console.log("the server is working");
});