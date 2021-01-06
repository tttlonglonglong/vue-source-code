将包变成全局的
先创建可执行的脚本 #! /usr/bin/env node
配置 package.json 中的bin字段
npm link 链接到本地环境(默认以name为基准), 根据目录下运行
link：相当于将当前本地模块链接到npm 目录下，这个npm目录可以直接访问，所以当前包就可以直接访问了
npm unlink 
1.配置可执行命令 commander
npm i commander： 基本所有的命令行工具，都是它写的
命令行颜色模块-chalk
2.实现脚手架，先做一个命令交互的功能  inquirer
3.将模板下载下来  download-git-repo

ora: 命令行loading效果


4.根据用户的选择动态的生成内容 metalsmith
