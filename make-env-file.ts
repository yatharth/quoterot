// Concatenates all the *.env files in secrets/ into one big .env file.
// This file is run automatically by `npm run build`.

import * as fs from 'fs'
import glob from 'glob'
import {resolve} from 'app-root-path'


const secretsFolder = resolve('secrets/')
const outFile = resolve('secrets/.env')

const secretFiles = glob.sync(`${secretsFolder}/*.env`)
const secretFileContents = secretFiles.map(file => fs.readFileSync(file, 'utf8'))
fs.writeFileSync(outFile, secretFileContents.join('\n'))
