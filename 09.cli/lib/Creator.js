const path = require('path')
const Inquirer = require('inquirer')
const ora = require('ora')
const downloadGitRepo = require('download-git-repo') // 不支持promise
const util = require(`util`)

const { sleep, wrapLoading } = require('./utils')
const { fetchRepoList, fetchTagList } = require("./request")


class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName
    this.target = targetDir
    // 将方法转化为promsie方法
    this.downloadGitRepo = util.promisify(downloadGitRepo)
    console.log('Creator--constructor', this.name, this.target)
  }
  async fetchRepo() {
    // 失败重新获取
    let repos = await wrapLoading(fetchRepoList, 'waiting fetch template')
    // console.log("所有仓库的模板---repos", repos)
    if (!repos) return;
    repos = repos.map(item => item.name)
    let { repo } = await Inquirer.prompt([
      {
        name: 'repo',
        type: 'list',
        choices: repos,
        message: 'please choose a template to create project'
      }
    ])
    // console.log('选择的仓库模板', repo)
    return repo

  }
  async fetchTag(repo) {
    let tags = await wrapLoading(fetchTagList, 'wating fetch tag', repo)
    // console.log('获取tagList', tags)
    if (!tags) return
    tags = tags.map(item => item.name)
    let { tag } = await Inquirer.prompt([
      {
        name: 'tag',
        type: 'list',
        choices: tags,
        message: 'please choose a tag to create project'
      }
    ])
    return tag
  }
  async download(repo, tag) {
    const spinner = ora('download....')
    spinner.start()
    // 1.需要拼接下载路径
    // zhu-cli/vue-template#1.0
    let requestUrl = `zhu-cli/${repo}${tag ? '#' + tag : ''}`
    // 2.资源下载到某个路径上(后续增加缓存功能, 应该可以下载到系统目录中，稍后可以再使用ejs handlebar 去渲染模板 最后生成结果 再写入)
    // 放到系统文件中 --> 模板和用户的其他选择 --> 生成结果 放到当前目录下
    await this.downloadGitRepo(requestUrl, path.resolve(process.cwd(), `${repo}@${tag}`)).catch(err => {
      console.log(`downloadErr: ${err}`)
      spinner.fail(`download failed: ${err}`)
    })
    spinner.succeed()
    return this.target
  }
  async create() {
    // 真实开始创建了

    // 采用远程拉取的方式 github， 没有版本的时候，直接git clone
    // 1）先去拉取当前组织下的模板
    let repo = await this.fetchRepo();
    // 2）再通过模板找到版本号
    let tag = await this.fetchTag(repo)
    // 3）下载
    let downloadurl = await this.download(repo, tag)
    console.log('下载的模板和版本', repo, tag)
    // 4) 编译模板

    // 2.实现脚手架，先做一个命令交互的功能  inquirer
    console.log('Creator', this.name, this.target)
    // 3.将模板下载下来  download-git-repo

    // 单独写个类去生成模板
    // 4.根据用户的选择动态的生成内容 metalsmith
  }

}

module.exports = Creator