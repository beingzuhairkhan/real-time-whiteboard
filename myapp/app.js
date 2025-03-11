import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
dotenv.config({ path: './.env', });
import { Server } from 'socket.io'
import http from "http";


export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8888"],
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE"] 
}));
app.use(morgan('dev'))


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8888"],
    credentials: true,
    methods: ["GET", "POST"],
  }
})

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  })

  socket.on("clear", () => {
    io.emit("clear");
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
})

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


// socket connection




app.get("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found'
  });
});




server.listen(port, () => console.log('Server is working on Port:' + port + ' in ' + envMode + ' Mode.'));