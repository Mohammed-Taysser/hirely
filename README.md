
Bulk apply is only available on Pro plans

endopoint replac with userdata only depeon on rle

Daily upload limit exceeded


invoices

graphql


fix password within users list



roles and amdin

    // TODO: allow admin override for plan limits when needed.


redus as limit middelware


maek as default resume

activity log

```txt
src/
  app.ts
  server.ts

  config/
    env.ts
    redis.ts
    prisma.ts
    bullmq.ts

  infrastructure/
    db/
      prisma.client.ts
    cache/
      redis.client.ts
      cache.service.ts
    queue/
      queue.manager.ts
      worker.ts

  modules/
    resume/
      resume.controller.ts
      resume.service.ts
      resume.repository.ts
      resume.jobs.ts
      resume.routes.ts
      resume.types.ts

    export/
      export.controller.ts
      export.service.ts
      export.jobs.ts
      export.worker.ts
      export.routes.ts

    auth/
      auth.controller.ts
      auth.service.ts
      auth.repository.ts
      auth.routes.ts

    user/
      user.service.ts
      user.repository.ts

  shared/
    errors/
    logger/
    utils/
    constants/

  jobs/
    index.ts   👈 boot all workers

  libs/
    pdf/
    email/
    storage/

  types/
    express.d.ts

  tests/
```