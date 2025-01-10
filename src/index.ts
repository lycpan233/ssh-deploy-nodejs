import * as core from '@actions/core';
import { NodeSSH, type Config } from 'node-ssh';

export async function run() {
  // 连接 ssh
  const ssh = new NodeSSH();

  const options: Config = {
    host: core.getInput('host'),
    username: core.getInput('username'),
    password: core.getInput('password'),
    port: Number.parseInt(core.getInput('port')),
  };
}

run();
