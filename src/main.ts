import { mainLoop } from './master'
import { mainLoop as workerMainLoop } from './worker' 
import { Command, Option } from 'commander'

const program = new Command()

program
    .name('kms.js')
    .description('KMS - Kubernertes Micro Scheduler. This project aims to solve the scheduler\'s scalability problem with an distributed approach based on microservices')
    .version('0.0.1')

program
    .command('master')
    .description('Runs the master instance')
    .requiredOption('-s, --strategy <name>', 'scheduler: RS (Random), RRS (Round Robin)')
    .action((params) => {
        if (!['RS', 'RRS'].includes(params.strategy)) {
            console.log(`Invalid strategy ${params.strategy}`)
            process.exit(1)
        }
        mainLoop(params.strategy)
    })


program
    .command('worker')
    .description('Runs the worker instance')
    .requiredOption('-n, --nodes <names...>', 'node names to attach to this worker instance')
    .action((params) => {
        workerMainLoop(params.nodes)
    })

program.parse()
