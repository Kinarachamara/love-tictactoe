const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <meta name="theme-color" content="#ff85a2"/>
  <title>Love Games 💗 You & Me</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #ffe6f0 0%, #fff0f5 50%, #f8e1ff 100%);
      color: #4a2c3f;
      text-align: center;
      overflow-x: hidden;
      background-attachment: fixed;
    }

    h1 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(3.2rem, 10vw, 5.8rem);
      color: #ff85a2;
      margin: 35px 0 20px;
      text-shadow: 0 6px 20px rgba(255, 133, 162, 0.45);
      animation: gentleFloat 8s ease-in-out infinite;
    }

    @keyframes gentleFloat {
      0%,100% { transform: translateY(0) rotate(0deg); }
      50%     { transform: translateY(-18px) rotate(1.5deg); }
    }

    button {
      padding: 16px 38px;
      border: none;
      border-radius: 999px;
      background: linear-gradient(45deg, #ff85a2, #ff9bb5);
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.35s ease;
      box-shadow: 0 10px 30px rgba(255, 133, 162, 0.4);
      margin: 14px 6px;
    }

    button:hover {
      transform: translateY(-5px) scale(1.08);
      box-shadow: 0 18px 45px rgba(255, 133, 162, 0.55);
      background: linear-gradient(45deg, #ff9bb5, #ff85a2);
    }

    input {
      padding: 16px 24px;
      border-radius: 999px;
      border: 2px solid #ffd1dc;
      width: 88%;
      max-width: 340px;
      font-size: 1.1rem;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(12px);
      color: #4a2c3f;
      margin: 16px 0;
    }

    input::placeholder {
      color: #d69bbe;
    }

    input:focus {
      outline: none;
      border-color: #ff85a2;
      box-shadow: 0 0 0 5px rgba(255, 133, 162, 0.25);
    }

    #mainMenu {
      margin: 50px 0;
    }

    #roomMenu {
      display: none;
      margin: 50px 0;
    }

    #game {
      opacity: 0;
      transform: translateY(50px);
      transition: all 0.8s ease;
      display: none;
    }

    #game.visible {
      opacity: 1;
      transform: translateY(0);
    }

    h3 {
      font-size: 1.5rem;
      color: #c85a8f;
      margin: 15px 0;
    }

    #status {
      font-size: 1.6rem;
      color: #6b3f5c;
      margin: 20px 0;
      font-weight: 500;
    }

    #tttBoard {
      display: grid;
      grid-template-columns: repeat(3, minmax(110px, 30vw));
      gap: 18px;
      justify-content: center;
      margin: 40px auto;
      max-width: 500px;
    }

    .cell {
      aspect-ratio: 1/1;
      background: rgba(255, 245, 250, 0.65);
      backdrop-filter: blur(16px);
      border-radius: 32px;
      font-size: clamp(60px, 15vw, 100px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.35s ease;
      box-shadow: 0 12px 35px rgba(200, 90, 143, 0.18);
      border: 2px solid rgba(255, 133, 162, 0.25);
    }

    .cell:hover {
      background: rgba(255, 245, 250, 0.9);
      transform: scale(1.08) rotate(2deg);
      border-color: #ff85a2;
    }

    .cell.heart { color: #ff4d82; animation: lovePop 0.6s; }
    .cell.love  { color: #ff85a2; animation: lovePop 0.6s; }

    @keyframes lovePop {
      0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
      60%  { transform: scale(1.25) rotate(8deg);  opacity: 1; }
      100% { transform: scale(1) rotate(0); }
    }

    #rpsChoices {
      display: flex;
      justify-content: center;
      gap: 25px;
      margin: 40px auto;
      max-width: 500px;
    }

    .rpsBtn {
      font-size: clamp(50px, 12vw, 80px);
      padding: 20px;
      background: rgba(255, 245, 250, 0.65);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.35s ease;
      box-shadow: 0 12px 35px rgba(200, 90, 143, 0.18);
      border: 2px solid rgba(255, 133, 162, 0.25);
    }

    .rpsBtn:hover {
      transform: scale(1.15);
      background: rgba(255, 245, 250, 0.9);
      border-color: #ff85a2;
    }

    #scores {
      font-size: 1.4rem;
      margin: 20px 0;
      color: #c85a8f;
    }

    #chat {
      background: rgba(255, 245, 250, 0.6);
      backdrop-filter: blur(18px);
      border-radius: 32px;
      width: 92%;
      max-width: 420px;
      margin: 35px auto;
      padding: 24px;
      border: 2px solid rgba(255, 133, 162, 0.3);
    }

    #messages {
      height: 200px;
      overflow-y: auto;
      text-align: left;
      padding-right: 12px;
      margin-bottom: 20px;
    }

    .msg {
      background: rgba(255, 209, 220, 0.5);
      padding: 12px 18px;
      border-radius: 24px;
      margin: 12px 0;
      font-size: 1.05rem;
      max-width: 80%;
      color: #4a2c3f;
    }

    .winOverlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 245, 250, 0.92);
      backdrop-filter: blur(14px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .winBox {
      background: white;
      border: 4px solid #ff85a2;
      border-radius: 40px;
      padding: 40px 30px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 30px 80px rgba(255, 133, 162, 0.4);
      text-align: center;
      animation: sweetAppear 0.7s ease;
    }

    @keyframes sweetAppear {
      from { opacity: 0; transform: scale(0.7) translateY(40px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .bigSymbol {
      font-size: 140px;
      margin-bottom: 25px;
      text-shadow: 0 6px 25px rgba(255, 77, 130, 0.5);
    }

    .bigSymbol.winner-heart {
      animation: loveBeat 1.4s infinite;
    }

    @keyframes loveBeat {
      0%,100%   { transform: scale(1); }
      50%       { transform: scale(1.22); }
    }

    #resultText {
      color: #ff4d82;
      font-family: 'Dancing Script', cursive;
      font-size: 3.5rem;
      margin: 20px 0 35px;
    }
  </style>
</head>
<body>

<h1>💗 💋 💗</h1>

<div id="mainMenu">
  <button onclick="selectGame('ttt')">Play Tic-Tac-Toe ♡</button><br><br>
  <button onclick="selectGame('rps')">Play Rock-Paper-Scissors 💕</button>
</div>

<div id="roomMenu">
  <h2 id="gameTitle"></h2>
  <button onclick="createRoom()">Create Our Room</button><br><br>
  <input id="joinCode" placeholder="Enter Love Code 💕"/><br><br>
  <button onclick="joinRoom()">Join My Love</button>
</div>

<div id="game">
  <h3>Our Secret Room: <span id="roomCode"></span></h3>
  <h2 id="status"></h2>

  <div id="tttBoard" style="display:none"></div>
  <div id="rpsArea" style="display:none">
    <div id="rpsChoices">
      <div class="rpsBtn" onclick="makeChoice('rock')">✊</div>
      <div class="rpsBtn" onclick="makeChoice('paper')">✋</div>
      <div class="rpsBtn" onclick="makeChoice('scissors')">✌️</div>
    </div>
    <div id="scores"></div>
  </div>

  <button onclick="requestRestart()">♡ Play Again ♡</button>

  <div id="chat">
    <div id="messages"></div><br>
    <input id="chatInput" placeholder="Whisper something sweet... 💌"/><br><br>
    <button onclick="sendMsg()">Send My Heart</button>
  </div>
</div>

<div class="winOverlay" id="winOverlay">
  <div class="winBox">
    <div class="bigSymbol" id="resultSymbol"></div>
    <div id="resultText"></div>

    <div id="taskArea">
      <input id="taskInput" placeholder="Your cute wish for me... ♡"/><br><br>
      <button onclick="sendTask()">Send Wish</button>
    </div>

    <div id="closeArea" style="display:none">
      <button onclick="closePopup()">Close</button>
    </div>
  </div>
</div>

<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
let roomId = null, symbol = null, myTurn = false, gameType = null;
let board = Array(9).fill(""); // for ttt
let myChoice = null, scores = {me: 0, opponent: 0}; // for rps

const tttBoardDiv = document.getElementById("tttBoard");
for(let i = 0; i < 9; i++){
  const c = document.createElement("div");
  c.className = "cell";
  c.onclick = () => tttMove(i);
  tttBoardDiv.appendChild(c);
}

function selectGame(type) {
  gameType = type;
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("roomMenu").style.display = "block";
  document.getElementById("gameTitle").innerText = type === 'ttt' ? "Tic-Tac-Toe for Us ♡" : "Rock-Paper-Scissors Love 💕";
}

function createRoom(){ socket.emit("createRoom", {gameType}); }
function joinRoom(){ 
  const code = document.getElementById("joinCode").value.trim();
  if(code) socket.emit("joinRoom", {roomId: code, gameType});
}

socket.on("roomCreated", id => {
  roomId = id;
  document.getElementById("roomMenu").style.display = "none";
  setupGame();
  document.getElementById("roomCode").innerText = id;
  document.getElementById("status").innerText = "Waiting for my forever love 💗";
});

socket.on("startGame", d => {
  symbol = d.symbol;
  roomId = d.roomId;
  gameType = d.gameType;
  myTurn = d.playerIndex === 0;
  document.getElementById("roomMenu").style.display = "none";
  setupGame();
  document.getElementById("roomCode").innerText = roomId;
  updateStatus();
  if(gameType === 'rps') updateScores(d.scores || {0:0,1:0});
});

function setupGame() {
  document.getElementById("game").style.display = "block";
  document.getElementById("game").classList.add("visible");
  if(gameType === 'ttt') {
    document.getElementById("tttBoard").style.display = "grid";
    document.getElementById("rpsArea").style.display = "none";
  } else {
    document.getElementById("tttBoard").style.display = "none";
    document.getElementById("rpsArea").style.display = "block";
  }
}

function updateStatus(){
  if(gameType === 'ttt') {
    document.getElementById("status").innerText = myTurn ? "Your turn, my love ♡" : "Waiting for you... 💕";
  } else {
    document.getElementById("status").innerText = myChoice ? "Waiting for love's choice 💗" : "Choose your move ♡";
  }
}

function tttMove(i){
  if(gameType !== 'ttt' || !myTurn || board[i]) return;
  board[i] = symbol;
  renderTTT();
  socket.emit("move", {roomId, board});
  myTurn = false;
  updateStatus();
}

socket.on("update", data => {
  if(gameType === 'ttt') {
    board = data.board;
    myTurn = true;
    renderTTT();
    updateStatus();
  } else if(gameType === 'rps') {
    // For RPS update after round
    scores.me = data.scores[symbol === "❤️" ? 0 : 1];
    scores.opponent = data.scores[symbol === "❤️" ? 1 : 0];
    updateScores(data.scores);
    myChoice = null;
    updateStatus();
  }
});

function renderTTT(){
  document.querySelectorAll(".cell").forEach((c, i) => {
    c.innerText = board[i];
    c.className = "cell";
    if(board[i]){
      c.classList.add(board[i] === "❤️" ? "heart" : "love");
    }
  });
}

function makeChoice(choice){
  if(gameType !== 'rps' || myChoice) return;
  myChoice = choice;
  socket.emit("choice", {roomId, choice});
  updateStatus();
}

function updateScores(rawScores){
  const myScore = symbol === "❤️" ? rawScores[0] : rawScores[1];
  const oppScore = symbol === "❤️" ? rawScores[1] : rawScores[0];
  document.getElementById("scores").innerText = "You: " + myScore + " ♡ Love: " + oppScore;

}

socket.on("roundResult", data => {
  // Show result, e.g. status
  let resultText = "You chose " + data.myChoice + ", Love chose " + data.oppChoice + ". ";
  if(data.winner === 'me') resultText += "You win this round! ♡";
  else if(data.winner === 'opponent') resultText += "Love wins this round 💗";
  else resultText += "It's a tie! 💕";
  document.getElementById("status").innerText = resultText;
  setTimeout(() => {
    myChoice = null;
    updateStatus();
  }, 3000);
});

socket.on("win", winData => {
  document.getElementById("winOverlay").style.display = "flex";
  const symEl = document.getElementById("resultSymbol");
  symEl.innerText = winData.symbol;
  
  if(winData.isWinner){
    document.getElementById("resultText").innerText = "You Won My Heart! ♡";
    symEl.classList.add("winner-heart");
    document.getElementById("taskArea").style.display = "block";
    document.getElementById("closeArea").style.display = "none";
  } else {
    document.getElementById("resultText").innerText = "You Stole My Heart Anyway 💗";
    document.getElementById("taskArea").style.display = "none";
    document.getElementById("closeArea").style.display = "block";
  }
});

function sendTask(){
  const task = document.getElementById("taskInput").value.trim();
  if(task){
    socket.emit("task", {roomId, task});
  }
  document.getElementById("winOverlay").style.display = "none";
}

function closePopup(){
  document.getElementById("winOverlay").style.display = "none";
}

function requestRestart(){
  socket.emit("restart", roomId);
}

socket.on("restart", (data) => {
  if(gameType === 'ttt') {
    board = Array(9).fill("");
    renderTTT();
  } else {
    myChoice = null;
    scores = {me:0, opponent:0};
    updateScores(data.scores);
  }
  document.getElementById("winOverlay").style.display = "none";
  myTurn = symbol === "❤️";
  updateStatus();
});

function sendMsg(){
  const msg = document.getElementById("chatInput").value.trim();
  if(msg){
    socket.emit("chat", {roomId, msg});
    document.getElementById("chatInput").value = "";
  }
}

socket.on("chat", m => {
  const d = document.createElement("div");
  d.className = "msg";
  d.innerText = m;
  document.getElementById("messages").appendChild(d);
  d.scrollIntoView({behavior: "smooth"});
});

socket.on("task", task => {
  alert("Your love's wish: " + task); // Simple for now, can improve
});
</script>

</body>
</html>
  `);
});

io.on("connection", socket => {
  socket.on("createRoom", ({gameType}) => {
    const id = Math.random().toString(36).substring(2, 8);
    rooms[id] = {
      type: gameType,
      players: [socket.id],
      state: gameType === 'ttt' ? {board: Array(9).fill("")} : {choices: {}, scores: [0,0]}
    };
    socket.join(id);
    socket.emit("roomCreated", id);
  });

  socket.on("joinRoom", ({roomId: id, gameType}) => {
    const r = rooms[id];
    if (!r || r.type !== gameType || r.players.length === 2) return;
    r.players.push(socket.id);
    socket.join(id);

    const symbols = ["❤️", "💗"];
    io.to(r.players[0]).emit("startGame", { symbol: symbols[0], roomId: id, gameType, playerIndex: 0, scores: r.state.scores });
    socket.emit("startGame", { symbol: symbols[1], roomId: id, gameType, playerIndex: 1, scores: r.state.scores });
  });

  socket.on("move", ({ roomId, board }) => {
    const r = rooms[roomId];
    if(r.type !== 'ttt') return;
    r.state.board = board;
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        const winnerIndex = board[a] === "❤️" ? 0 : 1;
        io.to(r.players[0]).emit("win", {symbol: board[a], isWinner: winnerIndex === 0});
        io.to(r.players[1]).emit("win", {symbol: board[a], isWinner: winnerIndex === 1});
        return;
      }
    }
    socket.to(roomId).emit("update", {board});
  });

  socket.on("choice", ({ roomId, choice }) => {
    const r = rooms[roomId];
    if(r.type !== 'rps') return;
    const playerIndex = r.players.indexOf(socket.id);
    r.state.choices[playerIndex] = choice;
    if(Object.keys(r.state.choices).length === 2) {
      const [c0, c1] = [r.state.choices[0], r.state.choices[1]];
      let winner = null;
      if(c0 === c1) winner = 'tie';
      else if(
        (c0 === 'rock' && c1 === 'scissors') ||
        (c0 === 'scissors' && c1 === 'paper') ||
        (c0 === 'paper' && c1 === 'rock')
      ) {
        winner = 0;
        r.state.scores[0]++;
      } else {
        winner = 1;
        r.state.scores[1]++;
      }

      // Emit round result
      io.to(r.players[0]).emit("roundResult", {myChoice: c0, oppChoice: c1, winner: winner === 0 ? 'me' : winner === 1 ? 'opponent' : 'tie'});
      io.to(r.players[1]).emit("roundResult", {myChoice: c1, oppChoice: c0, winner: winner === 1 ? 'me' : winner === 0 ? 'opponent' : 'tie'});

      // Check overall win (first to 3)
      if(r.state.scores[0] >= 3 || r.state.scores[1] >= 3) {
        const overallWinner = r.state.scores[0] >= 3 ? 0 : 1;
        const winSymbol = overallWinner === 0 ? "❤️" : "💋";
        io.to(r.players[0]).emit("win", {symbol: winSymbol, isWinner: overallWinner === 0});
        io.to(r.players[1]).emit("win", {symbol: winSymbol, isWinner: overallWinner === 1});
      } else {
        // Continue
        io.to(roomId).emit("update", {scores: r.state.scores});
      }
      r.state.choices = {};
    }
  });

  socket.on("restart", roomId => {
    const r = rooms[roomId];
    if(r.type === 'ttt') r.state.board = Array(9).fill("");
    else {
      r.state.scores = [0,0];
      r.state.choices = {};
    }
    io.to(roomId).emit("restart", {scores: r.state.scores});
  });

  socket.on("chat", d => io.to(d.roomId).emit("chat", d.msg));
  socket.on("task", d => socket.to(d.roomId).emit("task", d.task));
});

server.listen(3000, () => {
  console.log("💗 Love Games running → http://localhost:3000");
});
