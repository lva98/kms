import * as k8s from '@kubernetes/client-node'
import {ElectSchedulerStrategy, RandomStrategy, RoundRobinStrategy, Strategies} from './types';
import { startSocketioServer, sockets } from './socket.master'
import { Socket } from 'socket.io'

const schedulers: string[] = []
const lastSchedulerIndex: number = 0
let electSchedulerStrategy: ElectSchedulerStrategy = new RandomStrategy()

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const listUnscheduledPods = async () => {
    const pods = await k8sApi.listPodForAllNamespaces(
        undefined,
        undefined,
        `spec.nodeName=,spec.schedulerName=kms`
    )

    if (pods.body.items.length > 0) {
        console.log(`[listUnscheduledPods] ${pods.body.items.length} Pods on schedule queue`)
        pods.body.items.forEach(pod => assignPodToWorker(pod))
    } else {
        console.log(`[listUnscheduledPods] empty queue`)
    }
}

const assignPodToWorker = async (pod: k8s.V1Pod) => {
    const namespace = pod.metadata?.namespace ?? 'default'
    const name = pod.metadata?.name

    try {
        if (sockets.length === 0) {
            throw 'There is no socket connected'
        }
        const socket = electSchedulerStrategy.execute(sockets)
        socket.emit('scheduler', {
            namespace,
            name
        })
        console.log(`[assignPodToWorker] Scheduling "${pod.metadata?.name}" on "${socket.id}"`)
    } catch (err: any) {
        console.log(`[assignPodToWorker] ${err?.message ?? err}`)
    }
}

export const mainLoop = async (strategy: Strategies) => {
    console.log(`Started master\nSchedulers: ${schedulers}`)

    switch (strategy) {
        case Strategies.RandomStrategy:
            electSchedulerStrategy = new RandomStrategy()
            console.log('Strategy: RandomStrategy')
        break; 
        case Strategies.RoundRobinStrategy:
            electSchedulerStrategy = new RoundRobinStrategy()
            console.log('Strategy: RoundRobinStrategy')
        break;
    }

    startSocketioServer()

    for (;;) {
        listUnscheduledPods()
        await new Promise((resolve) => setTimeout(resolve, 5e3))
    }
}
