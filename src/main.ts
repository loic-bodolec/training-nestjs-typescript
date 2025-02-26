import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GraphPublisher } from '@nestjs/devtools-integration';

async function bootstrap() {
  const logger = new Logger('MainLogger');
  const shouldPublishGraph = process.env.PUBLISH_GRAPH === 'true';

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    preview: shouldPublishGraph,
  });

  if (shouldPublishGraph) {
    await app.init();

    const publishOptions = {
      apiKey: process.env.GRAPH_API_KEY,
      owner: process.env.REPO_OWNER,
      repository: process.env.REPO_NAME,
      branch: process.env.BRANCH_NAME,
      commit: process.env.COMMIT_SHA,
      trigger: process.env.TRIGGER_EVENT as 'push' | 'pull',
      sha: process.env.SHA,
    }; // NOTE: this options object will vary depending on the CI/CD provider you're using
    const graphPublisher = new GraphPublisher(app);
    await graphPublisher.publish(publishOptions);

    await app.close();
    logger.log('Graph published and application closed.');
  } else {
    await app.listen(process.env.PORT ?? 3000);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  }
}

bootstrap();
