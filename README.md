# rabbitmq

How run:

1. Clone this repository to your local machine.
2. Install Docker and ensure it is running.
3. Navigate into the cloned repository directory.
4. Run `npm run up` in your terminal to start the Docker containers.
5. Make a sample POST request to test it:

```
POST http://localhost:3000/

Body (JSON):

{
"message": "Hello World!"
}
```
