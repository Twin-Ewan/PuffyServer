import { info } from 'console';
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

  Balance.sort((a, b) =>
  {
    // Compares score (time) against each other
    return SortScores(a, b)
  })

  Cruiser.sort((a, b) =>
  {
      // Compares score (Crate Possible Percentage) against each other
      return SortScores(a, b)
  })

  Pipe.sort((a, b) =>
  {
      // Compares score (time) against each other
      return SortScores(a, b)
  })

  // Makes it whos the quickest instead
  Balance.reverse();
  Pipe.reverse();
  
  let TempSite = fs.readFileSync("./src/templates/site.html").toString();

  let Highscores: string = "";

  for(let a = 0; a < 3; a++)
  {
    let Minigame: string[] = [];

    let TableTemplate = fs.readFileSync("./src/templates/table.html").toString()

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

    for(let j = 0; j < 5  && j < Minigame.length; j++)
    {
      Highscores += "\n<tr>";

      let MinigameData = Minigame[j].split(',');
      for(let i = 0; i < Info; i++)
      {
        if(i == 1) continue; // Ignores Minigame Column
        Highscores += "<td>" + MinigameData[i] + "</td> \n";
      }

      Highscores += "</tr>";
    }

    Highscores +="\n</table>"
  }

  TempSite = TempSite.replace("<!-- Data goes heres!! -->", Highscores)

  res.send(TempSite);
})

function SortScores(A: string, B: string) : number
{
  // Score is the 4th comma
  let ScoreA = parseFloat(A.split(',')[4]);
  let ScoreB = parseFloat(B.split(',')[4]);

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