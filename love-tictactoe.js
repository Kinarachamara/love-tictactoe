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
  <title>Love Tic Tac Toe 💗 You & Me</title>

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

    #menu {
      margin: 50px 0;
    }

    #game {
      opacity: 0;
      transform: translateY(50px);
      transition: all 0.8s ease;
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

    #board {
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

<h1>💗 You & Me Forever 💗</h1>

<div id="menu">
  <button onclick="createRoom()">Create Our Room</button><br><br>
  <input id="joinCode" placeholder="Enter Love Code 💕"/><br><br>
  <button onclick="joinRoom()">Join My Love</button>
</div>

<div id="game">
  <h3>Our Secret Room: <span id="roomCode"></span></h3>
  <h2 id="status"></h2>

  <div id="board"></div>

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
let roomId = null, symbol = null, myTurn = false;
let board = Array(9).fill("");

const boardDiv = document.getElementById("board");
for(let i = 0; i < 9; i++){
  const c = document.createElement("div");
  c.className = "cell";
  c.onclick = () => move(i);
  boardDiv.appendChild(c);
}

function createRoom(){ socket.emit("createRoom"); }
function joinRoom(){ 
  const code = document.getElementById("joinCode").value.trim();
  if(code) socket.emit("joinRoom", code); 
}

socket.on("roomCreated", id => {
  roomId = id;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").classList.add("visible");
  document.getElementById("roomCode").innerText = id;
  document.getElementById("status").innerText = "Waiting for my forever love 💗";
});

socket.on("startGame", d => {
  symbol = d.symbol;
  roomId = d.roomId;
  myTurn = symbol === "❤️";
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").classList.add("visible");
  document.getElementById("roomCode").innerText = roomId;
  updateStatus();
});

function updateStatus(){
  document.getElementById("status").innerText = myTurn ? "Your turn, my love ♡" : "Waiting for you... 💕";
}

function move(i){
  if(!myTurn || board[i]) return;
  board[i] = symbol;
  render();
  socket.emit("move", {roomId, board});
  myTurn = false;
  updateStatus();
}

socket.on("update", b => {
  board = b;
  myTurn = true;
  render();
  updateStatus();
});

function render(){
  document.querySelectorAll(".cell").forEach((c, i) => {
    c.innerText = board[i];
    c.className = "cell";
    if(board[i]){
      c.classList.add(board[i] === "❤️" ? "heart" : "love");
    }
  });
}

socket.on("win", winSymbol => {
  document.getElementById("winOverlay").style.display = "flex";
  const symEl = document.getElementById("resultSymbol");
  symEl.innerText = winSymbol;
  
  if(winSymbol === symbol){
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

socket.on("restart", () => {
  board = Array(9).fill("");
  render();
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
</script>

</body>
</html>
  `);
});

// ────────────────────────────────────────────────
// Backend logic remains the same (no changes needed)
// ────────────────────────────────────────────────

io.on("connection", socket => {
  socket.on("createRoom", () => {
    const id = Math.random().toString(36).substring(2, 8);
    rooms[id] = { players: [socket.id] };
    socket.join(id);
    socket.emit("roomCreated", id);
  });

  socket.on("joinRoom", id => {
    const r = rooms[id];
    if (!r || r.players.length === 2) return;
    r.players.push(socket.id);
    socket.join(id);

    io.to(r.players[0]).emit("startGame", { symbol: "❤️", roomId: id });
    io.to(r.players[1]).emit("startGame", { symbol: "💗", roomId: id });
  });

  socket.on("move", ({ roomId, board }) => {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        io.to(roomId).emit("win", board[a]);
        return;
      }
    }
    socket.to(roomId).emit("update", board);
  });

  socket.on("restart", roomId => {
    io.to(roomId).emit("restart");
  });

  socket.on("chat", d => io.to(d.roomId).emit("chat", d.msg));
  socket.on("task", d => socket.to(d.roomId).emit("task", d.task));
});

server.listen(3000, () => {
  console.log("💗 Love Tic Tac Toe running → http://localhost:3000");
});
