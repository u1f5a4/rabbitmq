import amqp from "amqplib";

class Rabbit {
  connection: amqp.Connection | undefined;

  constructor() {}

  async connect() {
    const RABBITMQ_URL = process.env.RABBITMQ_URL;
    if (!RABBITMQ_URL) throw new Error("RABBITMQ_URL is not defined");

    this.connection = await amqp.connect(RABBITMQ_URL);
    console.log("Connected to RabbitMQ");
    return this;
  }

  async publish(queue: string, messageId: string, message: string) {
    if (!this.connection) throw new Error("Connection is not defined");

    const channel = await this.connection.createChannel();
    await channel.assertQueue(queue);

    channel?.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
      messageId: messageId,
    });

    channel.close();
  }

  async receive(queue: string, handler: (msg: amqp.Message) => void) {
    const connection = this.connection;
    if (!connection) throw new Error("Connection is not defined");

    const channel = await connection.createChannel();
    await channel.assertQueue(queue);

    channel.consume(queue, (msg) => {
      if (!msg) return;

      handler(msg);

      channel.ack(msg);
    });
  }
}

export default new Rabbit();
