import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class PageGateway implements OnModuleInit {
    @WebSocketServer() Server: Server;

    onModuleInit() {
        // this.Server.on('connection', (socket) => {
        //     console.log(socket.id);
        //     console.log('Connected');
        // });
    }

    @SubscribeMessage('updatePage')
    handleUpdatePage(@MessageBody() body: any) {
        this.Server.emit('OnPageUpdate', {
            msg: 'Page Upated',
            content: body,
        });
    }
}
