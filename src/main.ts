import * as core from '@actions/core';
import assert from 'assert';
import { SSHExecCommandOptions, type Config } from 'node-ssh';
import { CustomSSH } from './custom-ssh';

// 获取连接配置
function getConnectConfig(): Config {
  try {
    // 校验入参
    assert(core.getInput('host') !== '', 'The host cannot be empty');
    assert(core.getInput('username') !== '', 'The username cannot be empty');
    if (core.getInput('port') !== '') {
      assert(Number.isInteger(parseInt(core.getInput('port'))), 'The port must be a number');
      assert(
        Number(core.getInput('port')) >= 0 && Number(core.getInput('port')) <= 65535,
        'The port value ranges from 0 to 65535',
      );
    }
    assert(core.getInput('password') || core.getInput('privateKey'), 'password or privateKey must be provided');

    // 生成配置
    const config: Config = {
      host: core.getInput('host'),
      port: core.getInput('port') === '' ? 22 : Number(core.getInput('port')),
      username: core.getInput('username'),
    };
    if (core.getInput('password')) config.password = core.getInput('password');
    else if (core.getInput('privateKey')) config.privateKey = core.getInput('privateKey');
    else throw new Error('password or privateKey must be provided');

    return config;
  } catch (error: any) {
    core.setFailed(error.message);
    throw error;
  }
}

export async function run() {
  let ssh = new CustomSSH();
  try {
    // 连接 ssh
    const config = getConnectConfig();
    await ssh.connectSSH(config);

    // 尝试上传文件
    const [source, destination] = [core.getInput('source'), core.getInput('destination')];
    if (source && destination) {
      await ssh.uploadFile(source, destination);
    }

    // 执行命令
    let cmdList: string[] = core.getMultilineInput('scripts');
    if (cmdList.length) {
      let options: SSHExecCommandOptions = {};
      if (core.getInput('workdir')) {
        options.cwd = core.getInput('workdir');
      }

      await ssh.execScripts(cmdList, options);
    }
  } catch (error) {
    throw error;
  } finally {
    // 断开链接
    ssh.dispose();
    core.setOutput('status', 'Done');
  }
}
