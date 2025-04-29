import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export async function applySwaggerConfig(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Admin do Catalogo(Full Cycle)')
    .setDescription('The admin of catalog API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });
}