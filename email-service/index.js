const express = require('express')
const amqp = require("amqplib");
const EmailSender = require("./sendEmail");

const app = express()
var connection, channel;
const queueName1 = "email-service-queue";

async function connectToRabbitMQ() {
  const amqpServer = "amqp://guest:guest@rabbit:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName1);
}

connectToRabbitMQ().then(() => {
  channel.consume(queueName1, (data) => {
    const userInfo = JSON.parse(data.content.toString());
    console.log(userInfo);
    EmailSender(userInfo.email, userInfo.fullName);
    channel.ack(data);
  });
});

app.listen(3000, () => {
  console.log("Server Email started");
})