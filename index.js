const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const bodyParser = require('body-parser');
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey);
require("dotenv").config();
// const AuthRouter = require("./routes/router");

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//Routes
// app.use(AuthRouter);
app.get("/", (req, res) => {
  res.send("hello").status(200);
});


app.get('/checkallpokemon', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pokemon')
      .select('*')
    
    if (error) throw error
    
    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong!' })
  }
})

// app.get("/pokemons", async (req, res) => {
//   try {
//     const { rows } = await pool.query('SELECT name FROM pokemon ORDER BY id');
//     res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching Pokemon data from database.');
//   }
// });
app.get("/pokemons", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pokemon')
      .select('name')
      .order('id');
    if (error) {
      console.error(error);
      res.status(500).send('Error fetching Pokemon data from database.');
    } else {
      console.log(data)
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching Pokemon data from database.');
  }
});

// app.get("/pokemonsData", async (req, res) => {
//   const name = req.query.name;

//   if (!name) {
//     return res.status(400).send("Missing search term");
//   }

//   try {
//     const query = {
//       text: "SELECT * FROM pokemon WHERE name = $1",
//       values: [name],
//     };

//     const result = await pool.query(query);

//     if (result.rows.length === 0) {
//       return res.status(404).send("Pokemon not found");
//     }

//     const pokemon = result.rows[0];

//     let newS = pokemon.stats.replace(/{|}|"/g, "");
//     let SList = newS.split(",");

//     const jsonS = JSON.stringify(SList).replace(/\\\\/g, "");
//     const resultS = JSON.parse(jsonS);

//     let newM = pokemon.moves.replace(/{|}|"/g, "");
//     let MList = newM.split(",");
//     const jsonM = JSON.stringify(MList).replace(/\\\\/g, "");
//     const resultM = JSON.parse(jsonM);

//     let newT = pokemon.types.replace(/{|}|"/g, "");
//     let TList = newT.split(",");

//     let stats = [];
//     for (let i = 0; i < resultS.length; i += 2) {
//       const name = resultS[i].split(":")[1];
//       const base_stat = resultS[i + 1].split(":")[1];
//       stats.push({ name, base_stat });
//     }

//     const formattedPokemon = {
//       id: pokemon.id,
//       name: pokemon.name,
//       types: TList,
//       back_sprite: pokemon.back_sprite,
//       dreamworld_sprite: pokemon.dreamworld_sprite,
//       frontSprite: pokemon.front_sprite,
//       height: pokemon.height,
//       pokemonId: pokemon.id,
//       moves: resultM,
//       weight: pokemon.weight,
//       stats: stats,
//     };

//     res.json(formattedPokemon);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching Pokemon data from database.");
//   }
// });

app.get("/pokemonsData", async (req, res) => {
  const name = req.query.name;

  if (!name) {
    return res.status(400).send("Missing search term");
  }

  try {
    const { data: pokemon, error } = await supabase
      .from("pokemon")
      .select()
      .eq("name", name)
      .single();

    if (error) {
      console.error(error);
      return res.status(500).send("Error fetching Pokemon data from database.");
    }
    if (!pokemon) {
      return res.status(404).send("Pokemon not found");
    }

    let stats = JSON.parse(pokemon.stats.replace(/'/g, '"')).map(({ name, base_stat }) => ({ name, base_stat }));
    let types = JSON.parse(pokemon.types.replace(/'/g, '"'));
    let moves = JSON.parse(pokemon.moves.replace(/'/g, '"'));

    const formattedPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      types,
      back_sprite: pokemon.back_sprite,
      dreamworld_sprite: pokemon.dreamworld_sprite,
      frontSprite: pokemon.front_sprite,
      height: pokemon.height,
      pokemonId: pokemon.id,
      moves,
      weight: pokemon.weight,
      stats,
    };

    res.json(formattedPokemon);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching Pokemon data from database.");
  }
});




app.get("/insertPokemon", async (req, res) => {
  try {
    let num = 1
    while(num <= 10){
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${num}/`);
    const data = await response.json();

    for (let pokemon of data.results) {
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
      const pokemonData = await pokemonResponse.json();

      let name, pokemon_id, types, height, moves, front_sprite, back_sprite, dreamworld_sprite,stats,weight
      pokemon_id = pokemonData.id
      name = pokemon.name
      dreamworld_sprite = pokemonData.sprites.other.dream_world.front_default
      height = pokemonData.height
      moves = pokemonData.moves.map((move) => move.move.name)
      front_sprite = pokemonData.sprites.front_default;
      back_sprite = pokemonData.sprites.back_default;
      stats = pokemonData.stats.map((stat) => ({ name: stat.stat.name, base_stat: stat.base_stat }))
      types = pokemonData.types.map((type) => type.type.name)
      weight = pokemonData.weight

      await sendingThePokemon(pokemon_id,name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight);
    }
num ++
  }
  res.status(200).send('Successfully inserted Pokemon names to the database.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting Pokemon names into the database.');
  }
});

async function sendingThePokemon(pokemon_id,name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight){
  const { data, error } = await supabase.from('pokemon').insert([{ pokemon_id, name, types, height, moves, front_sprite, back_sprite, dreamworld_sprite, stats, weight }], { returning: "minimal" });
  if (error) {
    throw error;
  }
}


// pool.query(`
//   CREATE TABLE IF NOT EXISTS pokemon (
//     id SERIAL PRIMARY KEY,
//     pokemon_id INTEGER UNIQUE,
//     name VARCHAR(255),
//     abilities VARCHAR(255),
//     types VARCHAR(255),
//     appearances VARCHAR(255),
//     height FLOAT,
//     moves VARCHAR(5000),
//     front_sprite VARCHAR(255),
//     back_sprite VARCHAR(255),
//     dreamworld_sprite VARCHAR(255),
//     stats VARCHAR(2000),
//     weight FLOAT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//   );
// `, (err, res) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log('Table created successfully');
//   }
//   pool.end();
// });


const port =   process.env.PORT || 4000;
app.listen(port, () => {
  console.log("the server is working");
});