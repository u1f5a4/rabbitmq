FROM oven/bun

WORKDIR /app
ADD src src
ADD package.json package.json
ADD bun.lockb bun.lockb
RUN bun install

CMD bun run dev
# CMD bun run start