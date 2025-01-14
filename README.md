# ssh-deploy-nodejs

支持在 Github Action 中，通过 SSH 链接远程服务器，执行命令。
本项目基于 [node-ssh](https://github.com/mscdex/ssh2) 实现

# 可用变量
详情可参阅 [action.yml](action.yml)

- `host` - 远程服务器地址
- `username` - 远程服务器用户名
- `port` - 远程服务器端口, 默认 22
- `password` - 远程服务器密码, password 和 privateKey 二选一
- `privateKey` - 远程服务器私钥, password 和 privateKey 二选一

- `workdir` - 指定工作目录

- `source` - 需要上传的源文件地址
- `destination` - 服务器的目标地址

- `scripts` - 上传文件后需要执行的命令, 支持多行命令

# 实例
```yaml
name: Test

on:
  push:
    branches:
      - releases/*


jobs:
  deployment_test:
    name: Build and Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.14.0"
      
      - name: Install dependencies
        run: |
          npm install

      - name: Compressed project files
        run: tar -zcvf ../release.tgz ./

      - name: SSH Deploy Node.js
        uses: ./
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          privateKey: ${{ secrets.SSH_PEM }}
          source: "../release.tgz"
          destination: "/home/release.tgz"
          workdir: "/home"
          scripts: |
            rm -rf /home/app && mkdir /home/app
            tar -zxvf release.tgz -C /home/app && rm -rf release.tgz
            source ~/.zshrc && cd /home/app && npm start
```