import { info, table } from 'console';
import express from 'express';
import fs from 'fs';
import { parse } from 'path';

const app = express()
const port = 3000

app.use(express.raw({type:"text/plain"}))

app.use(express.static("./src"))

app.get('/', (req, res) => {

  const Info = 5;

  let file = fs.readFileSync("./src/Leaderboards.csv");
  let Data = String(file).split('\n');

  let Cruiser: string[] = [], Balance: string[] = [], Pipe: string[] = [];

  // Name, Minigame, Canal, Level, Score Metric
  Data.forEach(element => {
    
    switch(element.split(',')[1])
    {
      case "Lock Balance": Balance.push(element);
      break;

      case "Canal Cruiser": Cruiser.push(element);
      break;

      case "Pipe Mania": Pipe.push(element);
      break;
    }

  });

// Order the entries by level
  Balance.sort((a, b) => { return SortScores(a, b, 3) })
  Cruiser.sort((a, b) => { return SortScores(a, b, 3) })
  Pipe.sort((a, b) => { return SortScores(a, b, 3) })

  Balance.reverse();
  Cruiser.reverse();
  Pipe.reverse();

  let Highscores: string = "";

  for(let a = 0; a < 3; a++)
  {
    let Minigame: string[] = [];

    let TableTemplate = "<div>\n<img id=\"MinigameImg\" src=\"URL\">";

    switch(a)
    {
      case 0: 
      {
        Minigame = Balance;
        TableTemplate = TableTemplate.replace("URL", "./templates/Lock Balance.png");
        TableTemplate = TableTemplate.replace("Score", "Time");
      }
      break;

      case 1:
        {
          Minigame = Cruiser;
          TableTemplate = TableTemplate.replace("URL", "./templates/Canal Cruiser.png");
          TableTemplate = TableTemplate.replace("Score", "Crates Collection");
        }
      break;

      case 2:
        {
          Minigame = Pipe;
          TableTemplate = TableTemplate.replace("URL", "./templates/Pipe Panic.png");
          TableTemplate = TableTemplate.replace("Score", "Time");
        }
      break;
    }
    
    Highscores += TableTemplate;
    let Level = 1, counter = 0;

    let LevelData: string[] = [];
    for(let i = 0; i < Minigame.length; i++)
    {
      if(Level != parseInt(Minigame[i].split(",")[3]))
      {
        LevelData.sort((a, b) => { return SortScores(a, b, 4) })
        
        // Rank times shortest to longest
        if(a == 0 || a == 2) LevelData.reverse();

        let LevelTable = fs.readFileSync("./src/templates/Table.html").toString();
        LevelTable = LevelTable.replace("Level 1", "Level " + Level);
        Highscores += LevelTable;
        
        for(let j = 0; j < 5 && j < LevelData.length; j++)
        {
          Highscores += "<tr>\n";
          let MinigameData = LevelData[j].split(",");
          for(let k = 0; k < MinigameData.length; k++)
          {
            if(k == 1 || k == 3) continue;
            Highscores += "<td>" + MinigameData[k] + "</td>\n";
          }
          Highscores += "</tr>"
        }
        
        LevelData = [];
        LevelData[0] = Minigame[i];
        Level = parseInt(Minigame[i].split(",")[3]);
        counter = 1;

        Highscores += "</table>";
      }
      else
      {
        LevelData[counter] = Minigame[i];
        counter++;
      }
      
    }

    Highscores += "</div>";
  }

  let TempSite = fs.readFileSync("./src/templates/Site.html").toString();
  TempSite = TempSite.replace("<!-- Data goes heres!! -->", Highscores);

  res.send(TempSite);
})

function SortScores(A: string, B: string, data: number) : number
{
  // Score is the 4th comma
  let ScoreA = parseFloat(A.split(',')[data]);
  let ScoreB = parseFloat(B.split(',')[data]);

  return ScoreB - ScoreA;
}


app.post('/', (req, res) => {
  
    res.status(200); // "Received"
    res.send(req.body);

    fs.appendFileSync("./src/Leaderboards.csv", String(req.body) + "\n");

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})