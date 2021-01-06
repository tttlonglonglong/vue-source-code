// 通过axios来获取结果
const config = require('../config/index')
const axios = require('axios')

axios.interceptors.response.use(res => {
  return res.data
})

async function fetchRepoList() {
  // 通过配置文件，拉取不同的仓库对应的用户下的文件
  return axios.get(config.url.repoListUrl)

}

async function fetchTagList(repo) {
  console.log('fetchTagList 参数', repo)
  return axios.get(`https://api.github.com/repos/zhu-cli/${repo}/tags`)
}

module.exports = {
  fetchRepoList,
  fetchTagList
}