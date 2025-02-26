// NOTE 1: This file is the entry point of the application.
// NOTE 2: This file is responsible for creating the Nest application instance and starting the server.
// NOTE 3: This file is also responsible for publishing the graph snapshot to the DevTools server. (https://devtools.nestjs.com/login / https://docs.nestjs.com/devtools/ci-cd-integration)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GraphPublisher } from '@nestjs/devtools-integration';

async function bootstrap() {
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
  } else {
    await app.listen(process.env.PORT ?? 3000);
  }
}

bootstrap();
