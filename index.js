#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import writeFile from 'fs';
import * as crypto from './cryptographic.js';

const startMethod = [{
    type: 'list',
    name: 'method',
    message: 'What would you like to do?',
    choices: [
        'Verify a token',
        'Generate a token',
        'Pull details from a token',
        'Exit'
    ]
}]

await inquirer.prompt(startMethod).then(async (choice) => {
    switch (choice.method) {
        case 'Verify a token':
            // @ts-ignore
            const verQuestions = [
                {
                    type: 'input',
                    name: 'token',
                    message: 'What is the token you would like to verify?'
                },
                {
                    type: 'password',
                    name: 'signature',
                    message: 'What is the signature of the token?',
                    mask: '#'
                }
            ]
            await inquirer.prompt(verQuestions).then(async (info) => {
                const output = await crypto.verifyToken(info.token, info.signature)
                if (output == false) {
                    console.log(chalk.bold.red('Token is invalid'))
                    process.exit(1)
                }
                console.log(chalk.bold.green('Token is valid'))
                process.exit(0)
            })
            break;
        case 'Generate a token':
            // @ts-ignore
            const genQuestions = [
                {
                    type: 'input',
                    name: 'name',
                    message: 'Name:',
                },
                {
                    type: 'password',
                    name: 'id',
                    message: 'ID:',
                    mask: "#"
                },
                {
                    type: 'password',
                    name: 'signature',
                    message: 'Please enter a 64-character long string to use as a signature:',
                    mask: "#"
                },
                {
                    type: 'list',
                    name: 'saveType',
                    message: 'How would you like to receive the token?',
                    choices: [
                        'Save to a file',
                        'Log the output in the terminal'
                    ]
                }
            ]

            // @ts-ignore
            await inquirer.prompt(genQuestions).then(
                async (data) => {
                    if (data.saveType == 'Save to a file') {
                        await inquirer.prompt([{ type: 'input', name: 'filename', message: 'Filename:' }]).then(
                            (newData) => {
                                data.filename = newData.filename;
                            })
                    }
                    const token = await crypto.generateToken(
                        {
                            name: data.name,
                            id: data.id
                        },
                        data.signature);
                    return { token: token, saveType: data.saveType, filename: data.filename };
                }
            ).then((data) => {
                if (data.saveType == 'Log the output in the terminal') {
                    console.log(`Token: ${data.token}`);
                }
                else {
                    // @ts-ignore
                    writeFile(
                        data.filename,
                        data.token,
                        (err) => {
                            if (err) throw err;
                            console.log('Token saved to file!');
                        }
                    )
                }
            })
            break;
        case 'Pull details from a token':
            await inquirer.prompt([
                {
                    type: 'input',
                    name: 'token',
                    message: 'What is the token?'
                }
            ]).then(async (data) => {
                const output = await crypto.decodeToken(data.token);
                await console.log(output);
                process.exit(0);
            })
            break;
        case 'Exit':
            process.exit(0)
    }
})