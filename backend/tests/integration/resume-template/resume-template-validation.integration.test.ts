import validateRequest from '@dist/middleware/validate-request.middleware';
import resumeTemplateDTO from '@dist/modules/resumeTemplate/presentation/resumeTemplate.dto';
import { runMiddleware } from '../helpers/http-middleware.helper';

describe('resume template validation integration', () => {
  it('accepts empty query for list endpoint', async () => {
    const request: Record<string, unknown> = {
      body: {},
      query: {},
      params: {},
    };

    const err = await runMiddleware(
      validateRequest(resumeTemplateDTO.listResumeTemplates),
      request
    );
    expect(err).toBeUndefined();
    expect(request.parsedQuery).toBeDefined();
  });
});
