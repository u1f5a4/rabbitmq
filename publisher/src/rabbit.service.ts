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

  async publish(queue: string, uuid: string, message: string) {
    if (!this.connection) throw new Error("Channel is not defined");

    const channel = await this.connection.createChannel();
    await channel.assertQueue(queue);

    channel?.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
      messageId: uuid,
    });

    channel.close();
  }

  async receive(queue: string, messageId: string, timeout = 10000) {
    const connection = this.connection;
    if (!connection) throw new Error("Connection is not defined");

    const channel = await connection.createChannel();
    await channel.assertQueue(queue);

    const message = await new Promise<amqp.Message>(async (resolve, reject) => {
      const timeoutReject = setTimeout(() => reject("Timeout"), timeout);

      channel.consume(queue, (msg) => {
        if (!msg) return;

        if (msg.properties.messageId !== messageId) {
          channel.nack(msg);
          return;
        }

        channel.ack(msg);
        clearTimeout(timeoutReject);
        resolve(msg);
      });
    }).finally(async () => await channel.close());

    return message;
  }
}

export default new Rabbit();
