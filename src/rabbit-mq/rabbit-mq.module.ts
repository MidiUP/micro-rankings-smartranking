import { ClientProxyConnections } from './client-proxy-connections';
import { Module } from '@nestjs/common';

@Module({
  providers: [ClientProxyConnections],
  exports: [ClientProxyConnections],
})
export class RabbitMqModule {}
