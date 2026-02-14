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
<html lang="si">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="theme-color" content="#ff2e63"/>
  <title>Tic Tac Toe 💖 WASSI 🌝</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
      color: #fff;
      text-align: center;
      overflow-x: hidden;
      background-attachment: fixed;
    }

    h1 {
      font-size: clamp(2rem, 8vw, 4rem);
      margin: 30px 0 20px;
      color: #fff;
      text-shadow: 0 5px 20px rgba(255,46,99,0.6);
      animation: float 7s ease-in-out infinite;
    }

    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-15px); }
    }

    button {
      padding: 14px 34px;
      border: none;
      border-radius: 50px;
      background: #ff2e63;
      color: white;
      font-size: 1.15rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(255,46,99,0.45);
      margin: 12px 0;
    }

    button:hover {
      transform: translateY(-4px) scale(1.06);
      box-shadow: 0 14px 35px rgba(255,46,99,0.6);
      background: #ff477e;
    }

    button:active {
      transform: translateY(1px);
    }

    input {
      padding: 14px 20px;
      border-radius: 50px;
      border: none;
      width: 85%;
      max-width: 320px;
      font-size: 1.05rem;
      background: rgba(255,255,255,0.28);
      backdrop-filter: blur(12px);
      color: white;
      margin: 14px 0;
    }

    input::placeholder {
      color: rgba(255,255,255,0.75);
    }

    input:focus {
      outline: none;
      box-shadow: 0 0 0 4px rgba(255,46,99,0.45);
      background: rgba(255,255,255,0.38);
    }

    #menu {
      margin: 40px 0;
    }

    #game {
      opacity: 0;
      transform: translateY(40px);
      transition: all 0.7s ease;
    }

    #game.visible {
      opacity: 1;
      transform: translateY(0);
    }

    h3, h2 {
      margin: 12px 0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    #board {
      display: grid;
      grid-template-columns: repeat(3, minmax(100px, 28vw));
      gap: 16px;
      justify-content: center;
      margin: 35px auto;
      max-width: 460px;
    }

    .cell {
      aspect-ratio: 1/1;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(14px);
      border-radius: 28px;
      font-size: clamp(50px, 13vw, 90px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.15);
    }

    .cell:hover {
      background: rgba(255,255,255,0.32);
      transform: scale(1.07);
    }

    .cell.heart { color: #ff2e63; animation: pop 0.45s; }
    .cell.love  { color: #ff477e; animation: pop 0.45s; }

    @keyframes pop {
      0%   { transform: scale(0.5) rotate(-10deg); }
      60%  { transform: scale(1.18) rotate(5deg); }
      100% { transform: scale(1) rotate(0); }
    }

    #chat {
      background: rgba(255,255,255,0.18);
      backdrop-filter: blur(14px);
      border-radius: 28px;
      width: 92%;
      max-width: 400px;
      margin: 30px auto;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.12);
    }

    #messages {
      height: 180px;
      overflow-y: auto;
      text-align: left;
      padding-right: 10px;
      margin-bottom: 15px;
    }

    .msg {
      background: rgba(0,0,0,0.28);
      padding: 10px 16px;
      border-radius: 20px;
      margin: 10px 0;
      font-size: 1rem;
      max-width: 82%;
      word-wrap: break-word;
    }

    #status {
      font-size: 1.4rem;
      margin: 15px 0;
    }

    .winOverlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.78);
      backdrop-filter: blur(10px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999;
    }

    .winBox {
      background: rgba(255,255,255,0.95);
      color: #222;
      padding: 35px 25px;
      border-radius: 36px;
      width: 90%;
      max-width: 380px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.45);
      text-align: center;
      animation: appear 0.6s ease;
    }

    @keyframes appear {
      from { opacity: 0; transform: scale(0.65) translateY(30px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .bigSymbol {
      font-size: 120px;
      margin-bottom: 20px;
      text-shadow: 0 5px 20px rgba(255,46,99,0.5);
    }

    .bigSymbol.winner-heart {
      animation: heartbeat 1.3s infinite;
    }

    @keyframes heartbeat {
      0%,100%   { transform: scale(1); }
      50%       { transform: scale(1.18); }
    }

    #resultText {
      color: #ff2e63;
      font-size: 2rem;
      margin: 15px 0 30px;
    }
  </style>
</head>
<body>

<h1>💖🌝 උම්ම්ම්ම්ම 😘🌝💖</h1>

<div id="menu">
  <button onclick="createRoom()">Create Room</button><br><br>
  <input id="joinCode" placeholder="Enter Room Code 💌"/><br><br>
  <button onclick="joinRoom()">Join Room</button>
</div>

<div id="game">
  <h3>Room: <span id="roomCode"></span></h3>
  <h2 id="status"></h2>

  <div id="board"></div>

  <button onclick="requestRestart()">🔁 Restart Game</button>

  <div id="chat">
    <div id="messages"></div><br>
    <input id="chatInput" placeholder="Type sweet message 💕"/><br><br>
    <button onclick="sendMsg()">Send 💌</button>
  </div>
</div>

<div class="winOverlay" id="winOverlay">
  <div class="winBox">
    <div class="bigSymbol" id="resultSymbol"></div>
    <h2 id="resultText"></h2>

    <div id="taskArea">
      <input id="taskInput" placeholder="Give a cute task 😘"/><br><br>
      <button onclick="sendTask()">Send Task</button>
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
  document.getElementById("status").innerText = "Waiting for your love 💕";
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
  document.getElementById("status").innerText = myTurn ? "Your turn ❤️" : "Waiting for love 💕";
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
    c.className = "cell"; // reset
    if(board[i]){
      if(board[i] === "❤️") c.classList.add("heart");
      if(board[i] === "💕") c.classList.add("love");
    }
  });
}

socket.on("win", winSymbol => {
  document.getElementById("winOverlay").style.display = "flex";
  const symEl = document.getElementById("resultSymbol");
  symEl.innerText = winSymbol;
  
  if(winSymbol === symbol){
    document.getElementById("resultText").innerText = "YOU WIN ❤️";
    symEl.classList.add("winner-heart");
    document.getElementById("taskArea").style.display = "block";
    document.getElementById("closeArea").style.display = "none";
  } else {
    document.getElementById("resultText").innerText = "YOU LOSE 💔";
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

    // First player = ❤️    Second player = 💕
    io.to(r.players[0]).emit("startGame", { symbol: "❤️", roomId: id });
    io.to(r.players[1]).emit("startGame", { symbol: "💕", roomId: id });
  });

  socket.on("move", ({ roomId, board }) => {
    const wins = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];

    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        io.to(roomId).emit("win", board[a]);
        return;
      }
    }

    // No win → send update to opponent
    socket.to(roomId).emit("update", board);
  });

  socket.on("restart", roomId => {
    io.to(roomId).emit("restart");
  });

  socket.on("chat", d => {
    io.to(d.roomId).emit("chat", d.msg);
  });

  socket.on("task", d => {
    socket.to(d.roomId).emit("task", d.task);
  });
});

server.listen(3000, () => {
  console.log("💖 Server running → http://localhost:3000");
});
