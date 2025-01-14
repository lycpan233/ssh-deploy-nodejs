import * as core from '@actions/core';
import * as fs from 'fs';
import { NodeSSH, SSHExecCommandOptions, type Config } from 'node-ssh';

export class CustomSSH extends NodeSSH {
  constructor() {
    super();
  }

  /**
   * 连接 ssh
   * @param {Config} config
   */
  async connectSSH(config: Config) {
    try {
      await this.connect(config);

      if (!this.isConnected()) {
        let msg = 'ssh connection failed';
        core.setFailed(msg);
        throw new Error(msg);
      }
    } catch (error: any) {
      core.setFailed(error.message);
      throw error;
    }
  }

  /**
   * 上传文件到远程服务器
   * @param {string} localPath - 本地文件路径
   * @param {string} remotePath - 远程文件路径
   */
  async uploadFile(localPath: string, remotePath: string) {
    try {
      if (!fs.existsSync(localPath)) {
        throw new Error(`File ${localPath} does not exist`);
      }
      core.info(`Uploading file from ${localPath} to ${remotePath}`);

      await this.putFile(localPath, remotePath);

      core.info('Uploading file success');
    } catch (error: any) {
      core.setFailed(error.message);
      throw error;
    }
  }

  /**
   * 执行命令
   * @param {string[]} cmdList 命令列表
   * @param {SSHExecCommandOptions} [options={}] 执行命令的选项
   */
  async execScripts(cmdList: string[], options: SSHExecCommandOptions = {}) {
    for (const cmd of cmdList) {
      core.info(`Current command: ${cmd}`);
      const resp = await this.execCommand(cmd.trim(), options);
      core.info(`resp: ${JSON.stringify(resp)}`);
    }
  }
}
