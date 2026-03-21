import { getIo } from './index';

export function broadcastKeyEvent(event: string, payload: any) {
    console.log('Received key event', event, payload);
    const io = getIo();
    io.emit(event, payload);
}

export function broadcastSandboxEvent(event: string, payload: any) {
    console.log('Received sandbox event', event, payload);
    const io = getIo();
    io.emit(event, payload);
}

export function broadcastAttackEvent(event: string, payload: any) {
    console.log('Received attack event', event, payload);
    const io = getIo();
    io.emit(event, payload);
}