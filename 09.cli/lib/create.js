const path = require('path')
// const fs = require('fs') // 方法不全，很多功能不支持promise
const fs = require('fs-extra')
const Inquirer = require('inquirer')
const Creator = require('../lib/Creator')


// node可以动态的去导入，模块方法
module.exports = async function (projectName, options) {
  // 接收的参数
  // console.log(`接受的参数`, 'projectName', projectName, 'options', options)

  // 创建项目
  const cwd = process.cwd() // 获取当前命令执行时的工作目录
  const targetDir = path.resolve(cwd, projectName) // 目标目录

  // 判断目录是否已经存在
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      // 已经存在该目录的时候，是否强制创建
      await fs.remove(targetDir)
    } else {
      // 提示用户是否要覆盖
      let { action } = await Inquirer.prompt([ // 配置询问的方式
        {
          name: 'action',
          type: 'list', // 类型丰富，还有输入框、checkbox、radio
          message: `Target directory already exisits Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overWrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ])
      if (!action) {
        // 选择了取消
        return
      } else if (action === 'overWrite') {
        console.log(`\r\nRemoving......`)
        await fs.remove(targetDir)
      }
    }
  }

  // 创建项目
  const creator = new Creator(projectName, targetDir)
  creator.create()

}