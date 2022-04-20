import * as k8s from '@kubernetes/client-node'
import {addSchedulerListener} from './socket.worker';
import {ElectSchedulerStrategy, RandomStrategy, RoundRobinStrategy, Strategies} from './types';

let nodes: string[] = []
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const electNode = (): string => {
    const index = Math.round(Math.random() * nodes.length)
    const node = nodes[index]
    console.log(`[electNode] ${node} elected`)
    return node
}

const assignPodToNode = async (podName: string, namespace: string) => {
    console.log(`[assignPodToNode] Scheduling ${podName}`)
    const nodeName = electNode()
    const binding = new k8s.V1Binding()
    binding.apiVersion = 'v1'
    binding.kind = 'Binding'
    binding.metadata = new k8s.V1ObjectMeta()
    binding.metadata.name = podName 
    binding.target = new k8s.V1ObjectReference()
    binding.target.apiVersion = 'v1'
    binding.target.kind = 'Node'
    binding.target.name = nodeName

    if (!podName || !nodeName) {
        return
    }

    try {
        await k8sApi.createNamespacedPodBinding(podName, 'default', binding)
        console.log(`[assignPodToNode] Scheduled ${podName} on ${nodeName}`)
    } catch (err: any) {
        console.log(`[assignPodToNode] Error ${err?.message ?? err}`)
        console.error(err)
    }
}

export const mainLoop = async (nodeArgs: string[]) => {
    nodes = nodeArgs
    addSchedulerListener((args: any) => {
        assignPodToNode(args[0].name, args[0].namespace)
    })
}
