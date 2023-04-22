const express = require("express");
const cors = require("cors");
const amqp = require("amqplib");
const bodyParser = require("body-parser");

const app = express();
let connection, channel;
const queueName1 = "email-service-queue";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@rabbit:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName1);
}

const sendMail = (body) => {
  connectToRabbitMQ().then(() => {
    channel.sendToQueue(
      queueName1,
      Buffer.from(
        JSON.stringify({ fullName: body.fullName, email: body.email })
      )
    );
  });
};

app.post("/", (req, res) => {
  try {
    sendMail(req.body);
    res.json({ msg: "Check Your Email", status: 200 });
  } catch (err) {
    return res.json({ msg: "Error Occured: " + err, status: 505 });
  }
});

app.listen(3005, () => {
  console.log("Server 1 started");
});
