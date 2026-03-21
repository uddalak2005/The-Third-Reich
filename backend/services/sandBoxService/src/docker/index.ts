import Docker from 'dockerode'
import { v4 as uuid } from 'uuid'
import { ExecutionResult, SandboxStatus, SUSPICIOUS_PATTERNS } from '../types'

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

async function ensureImage(image: string): Promise<void> {
    try {
        await docker.getImage(image).inspect()
    } catch {
        console.log(`[Docker] Pulling image: ${image}`)
        await new Promise<void>((resolve, reject) => {
            docker.pull(image, (err: any, stream: any) => {
                if (err) return reject(err)
                docker.modem.followProgress(stream, (err: any) => {
                    if (err) reject(err)
                    else {
                        console.log(`[Docker] Image ready: ${image}`)
                        resolve()
                    }
                })
            })
        })
    }
}

export async function executeInSandbox(
    command: string[],
    image: string,
    timeoutMs: number,
): Promise<ExecutionResult> {

    await ensureImage(image)

    const sandboxId = uuid()
    const start = Date.now()
    let container: Docker.Container | null = null
    let stdout = ''
    let stderr = ''

    try {
        container = await docker.createContainer({
            name: `sentinel-sandbox-${sandboxId}`,
            Image: image,
            Cmd: command,
            NetworkDisabled: true,
            HostConfig: {
                ReadonlyRootfs: true,
                NetworkMode: 'none',
                Memory: 64 * 1024 * 1024,
                CpuQuota: 50000,
                AutoRemove: false,   // ← false so container exists long enough
                CapDrop: ['ALL'],
                SecurityOpt: ['no-new-privileges'],
            },
        })

        // Attach to stream BEFORE starting — captures all output
        const logStream = await container.attach({
            stream: true,
            stdout: true,
            stderr: true,
        })

        // Split the multiplexed Docker stream into stdout and stderr
        container.modem.demuxStream(
            logStream,
            { write: (chunk: Buffer) => { stdout += chunk.toString('utf8') } },
            { write: (chunk: Buffer) => { stderr += chunk.toString('utf8') } },
        )

        await container.start()

        // Wait for exit with timeout
        const waitResult = await Promise.race([
            container.wait(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
            ),
        ]) as { StatusCode: number }

        const durationMs = Date.now() - start
        const output = stdout + stderr
        const suspicious = SUSPICIOUS_PATTERNS.some(p => p.test(output))

        const status: SandboxStatus =
            suspicious ? 'anomaly' :
                waitResult.StatusCode !== 0 ? 'failed' :
                    'completed'

        return {
            sandboxId,
            stdout,
            stderr,
            exitCode: waitResult.StatusCode,
            durationMs,
            status,
        }

    } catch (err: any) {
        if (err.message === 'TIMEOUT') {
            return {
                sandboxId,
                stdout,
                stderr: 'Execution timed out',
                exitCode: -1,
                durationMs: timeoutMs,
                status: 'timeout',
            }
        }
        throw err

    } finally {
        // Always remove — whether success, timeout, or error
        if (container) {
            await container.remove({ force: true }).catch(() => { })
        }
    }
}