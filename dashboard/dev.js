import { spawn } from 'child_process';

const run = (name, command, args) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
};

const api = run('api', 'node', ['server.js']);
const vite = run('vite', 'node', ['node_modules/vite/bin/vite.js']);

const shutdown = () => {
  api.kill();
  vite.kill();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
