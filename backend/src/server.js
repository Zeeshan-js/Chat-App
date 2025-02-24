import { WebSocketServer } from 'ws';
import connectDB from './db/connectDB.js';
import dotenv from "dotenv"

dotenv.config()

const wss = new WebSocketServer({ port: 8080 });

connectDB()

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});