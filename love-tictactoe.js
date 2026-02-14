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
<html>
<head>
<meta charset="UTF-8">
<title>Tic Tac Toe for WASSI 💖</title>

<!-- MOBILE FULL SCREEN -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#ff2e63">

<style>
*{box-sizing:border-box}
body{
  margin:0;
  font-family:Arial;
  background:linear-gradient(135deg,#ff758c,#ff7eb3);
  color:white;
  text-align:center;
  min-height:100vh;
}
button{
  padding:12px 24px;
  border:none;
  border-radius:30px;
  background:#ff2e63;
  color:white;
  font-size:16px;
  cursor:pointer;
}
input{
  padding:10px 14px;
  border-radius:25px;
  border:none;
  outline:none;
  width:80%;
  max-width:260px;
}
#board{
  display:grid;
  grid-template-columns:repeat(3, minmax(80px, 22vw));
  gap:12px;
  justify-content:center;
  margin:20px auto;
}
.cell{
  aspect-ratio:1/1;
  background:rgba(255,255,255,0.3);
  font-size:clamp(40px,10vw,60px);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  border-radius:20px;
}
#chat{
  background:rgba(255,255,255,0.15);
  width:90%;
  max-width:340px;
  margin:20px auto;
  padding:12px;
  border-radius:20px;
}
#messages{
  height:140px;
  overflow-y:auto;
  text-align:left;
}
.msg{
  background:rgba(0,0,0,0.3);
  padding:6px 10px;
  border-radius:12px;
  margin-bottom:6px;
}
.winOverlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.85);
  display:none;
  justify-content:center;
  align-items:center;
}
.winBox{
  background:white;
  color:black;
  padding:25px;
  border-radius:25px;
  width:90%;
  max-width:320px;
}
.bigSymbol{font-size:90px;}
</style>
</head>

<body>

<h1>💖🌝   උම්ම්ම්ම්ම😘   🌝💖</h1>

<div id="menu">
  <button onclick="createRoom()">Create Room</button><br><br>
  <input id="joinCode" placeholder="Room Code"><br><br>
  <button onclick="joinRoom()">Join Room</button>
</div>

<div id="game" style="display:none">
  <h3>Room: <span id="roomCode"></span></h3>
  <h2 id="status"></h2>

  <div id="board"></div>

  <button onclick="requestRestart()">🔁 Restart Game</button>

  <div id="chat">
    <div id="messages"></div><br>
    <input id="chatInput" placeholder="Type sweet message 💌"><br><br>
    <button onclick="sendMsg()">Send</button>
  </div>
</div>

<div class="winOverlay" id="winOverlay">
  <div class="winBox">
    <div class="bigSymbol" id="resultSymbol"></div>
    <h2 id="resultText"></h2>

    <div id="taskArea">
      <input id="taskInput" placeholder="Give a task 😘"><br><br>
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
let roomId=null, symbol=null, myTurn=false;
let board=Array(9).fill("");

const boardDiv=document.getElementById("board");
for(let i=0;i<9;i++){
  const c=document.createElement("div");
  c.className="cell";
  c.onclick=()=>move(i);
  boardDiv.appendChild(c);
}

function createRoom(){ socket.emit("createRoom"); }
function joinRoom(){ socket.emit("joinRoom",joinCode.value); }

socket.on("roomCreated",id=>{
  roomId=id;
  menu.style.display="none";
  game.style.display="block";
  roomCode.innerText=id;
  status.innerText="Waiting for your love 💕";
});

socket.on("startGame",d=>{
  symbol=d.symbol;
  roomId=d.roomId;
  myTurn=symbol==="❤️";
  menu.style.display="none";
  game.style.display="block";
  roomCode.innerText=roomId;
  updateStatus();
});

function updateStatus(){
  status.innerText=myTurn?"Your turn ❤️":"Waiting for love 💕";
}

function move(i){
  if(!myTurn||board[i])return;
  board[i]=symbol;
  render();
  socket.emit("move",{roomId,board});
  myTurn=false;
  updateStatus();
}

socket.on("update",b=>{
  board=b;
  myTurn=true;
  render();
  updateStatus();
});

function render(){
  document.querySelectorAll(".cell")
    .forEach((c,i)=>c.innerText=board[i]);
}

socket.on("win",winSymbol=>{
  winOverlay.style.display="flex";
  if(winSymbol===symbol){
    resultSymbol.innerText=symbol;
    resultText.innerText="YOU WIN ❤️";
    taskArea.style.display="block";
    closeArea.style.display="none";
  }else{
    resultSymbol.innerText=winSymbol;
    resultText.innerText="YOU LOSE 💔";
    taskArea.style.display="none";
    closeArea.style.display="block";
  }
});

function sendTask(){
  socket.emit("task",{roomId,task:taskInput.value});
  winOverlay.style.display="none";
}

function closePopup(){ winOverlay.style.display="none"; }

function requestRestart(){
  socket.emit("restart",roomId);
}

socket.on("restart",()=>{
  board=Array(9).fill("");
  render();
  winOverlay.style.display="none";
  myTurn=symbol==="❤️";
  updateStatus();
});

function sendMsg(){
  socket.emit("chat",{roomId,msg:chatInput.value});
  chatInput.value="";
}

socket.on("chat",m=>{
  const d=document.createElement("div");
  d.className="msg";
  d.innerText=m;
  messages.appendChild(d);
});
</script>

</body>
</html>
`);
});

io.on("connection",socket=>{
socket.on("createRoom",()=>{
  const id=Math.random().toString(36).substring(2,7);
  rooms[id]={players:[socket.id]};
  socket.join(id);
  socket.emit("roomCreated",id);
});

socket.on("joinRoom",id=>{
  const r=rooms[id];
  if(!r||r.players.length===2)return;
  r.players.push(socket.id);
  socket.join(id);
  io.to(r.players[0]).emit("startGame",{symbol:"❤️",roomId:id});
  socket.emit("startGame",{symbol:"💕",roomId:id});
});

socket.on("move",({roomId,board})=>{
  const w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const[a,b,c]of w){
    if(board[a]&&board[a]===board[b]&&board[a]===board[c]){
      io.to(roomId).emit("win",board[a]);
      return;
    }
  }
  socket.to(roomId).emit("update",board);
});

socket.on("restart",roomId=>{
  io.to(roomId).emit("restart");
});

socket.on("chat",d=>io.to(d.roomId).emit("chat",d.msg));
socket.on("task",d=>socket.to(d.roomId).emit("task",d.task));
});

server.listen(3000,()=>console.log("💖 Running on http://localhost:3000"));

