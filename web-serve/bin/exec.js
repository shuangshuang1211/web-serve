#! /usr/bin/env node

// console.log('执行了')

const {program} = require('commander')
const options = {
  '-p --port <dir>': {
    'description': 'init server port',
    'example': 'webserve -p 3305'
  },
  '-d --directory <dir>': {
    'description': 'init server directory',
    'example': 'webserve -d C:'
  }
}
function formatConfig (configs, cb) {
  Object.entries(configs).forEach(([key, val]) => {
    cb(key, val)
  })
}
formatConfig(options, (cmd, data) => {
  program.option(cmd, data.description)
})

program.on('--help', () => {
  console.log('Examples:')
  formatConfig(options, (cmd, data) => {
    console.log(data.example)
  })
})

program
  .name('webserve')
  .version(require('../package.json').version)

program.parse(process.argv)
