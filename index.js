#!/usr/bin/env node --harmony
'use strict';

const fs = require('fs')
const chalk = require('chalk')
const cmd = require('node-cmd-promise')
const rimraf = require('rimraf')
const ora = require('ora')
const co = require('co')
const prompt = require('co-prompt')

const details = {
  name: process.argv[2] || false,
  author: "",
  description: "",
  license: "MIT",
  initialCommit: false,
  installDependencies: false
}

co(function *() {
  if(!details.name) details.name = yield prompt(chalk.green('? ')+chalk.cyan('Package name: '))
  details.author = yield prompt(chalk.green('? ')+chalk.cyan('Author: '))
  details.description = yield prompt(chalk.green('? ')+chalk.cyan('Description: '))
  details.license = yield prompt(chalk.green('? ')+chalk.cyan('License (MIT): '))
  details.installDependencies = yield prompt.confirm(chalk.green('? ')+chalk.cyan('Install dependencies? (Y/N) '))
  details.initialCommit = yield prompt.confirm(chalk.green('? ')+chalk.cyan('Initial commit? (Y/N) '))
  process.stdin.pause();
  
  if(!details.name){
    console.log(' ')
    console.log(chalk.red("Package name is required!"))
    process.exit(0)
  }
  if(fs.existsSync(details.name)) {
    console.log(' ')
    console.log(chalk.red(`Folder with name [${details.name}] exists!`))
    process.exit(0)
  }

  console.log(' ')
  console.log(chalk.yellow("Creating new project: ")+chalk.blue(details.name))
  console.log(' ')

  init()
})


const init = async () => {
  const spinner = ora({
    text: 'Setting up boilerplate',
    color: 'green'
  }).start();

  await cmd('git clone https://github.com/demtario/gulp-browsersync-php-template.git '+details.name)
  rimraf.sync(`./${details.name}/.git`)
  await cmd(`git init ${details.name}`)
  
  fs.readFile(`./${details.name}/package.json`, (err, data) => {
    if(err) throw err

    const json = JSON.parse(data)
    json.name = details.name
    json.author = details.author || ""
    json.description = details.description || ""
    json.license = details.license || "MIT"

    fs.writeFile(`./${details.name}/package.json`, JSON.stringify(json, null, 2), async (err) => {
      if(err) throw err
      
      if(details.installDependencies) {
        spinner.text = "Installing dependencies"
        await cmd(`cd ${details.name} && npm i`)
      }
      
      if(details.initialCommit) {
        spinner.text = "Commiting changes"
        await cmd(`cd ${details.name} && git add . && git commit -m ":tada: Initial commit"`)
      }

      spinner.stop()
      console.log(chalk.green('Project created successfully!'))
    })
  })
}
