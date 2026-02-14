import validateRequest from '@dist/middleware/validate-request.middleware';
import resumeDTO from '@dist/modules/resume/presentation/resume.dto';
import { z } from 'zod';
import { runErrorHandler, runMiddleware } from '../helpers/http-middleware.helper';

const buildResumeData = (sectionsCount: number) => {
  const sections: Record<string, { type: 'summary'; content: { text: string } }> = {};
  for (let index = 0; index < sectionsCount; index += 1) {
    sections[`section-${index}`] = {
      type: 'summary',
      content: { text: `Summary ${index}` },
    };
  }

  return {
    meta: { title: 'Resume Title', language: 'en' },
    sections,
  };
};

describe('validate-request middleware integration', () => {
  it('maps oversized resume sections to HTTP 400 payload', async () => {
    const maxSections = Number(process.env.MAX_RESUME_SECTIONS ?? 20);
    const request = {
      body: {
        name: 'My Resume',
        templateId: 'classic',
        data: buildResumeData(maxSections + 1),
      },
      query: {},
      params: {},
      originalUrl: '/api/resumes',
      method: 'POST',
    };

    const err = await runMiddleware(validateRequest(resumeDTO.createResume), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalled();

    const payload = response.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(JSON.stringify(payload.error)).toContain(`Max sections per resume is ${maxSections}`);
  });

  it('accepts request when sections count is within the configured limit', async () => {
    const maxSections = Number(process.env.MAX_RESUME_SECTIONS ?? 20);
    const request: Record<string, unknown> = {
      body: {
        name: 'My Resume',
        templateId: 'classic',
        data: buildResumeData(maxSections),
      },
      query: {},
      params: {},
    };

    const err = await runMiddleware(validateRequest(resumeDTO.createResume), request);
    expect(err).toBeUndefined();
    expect(request.parsedBody).toBeDefined();
  });

  it('passes through non-zod errors to error handler as HTTP 500', async () => {
    const request = {
      body: { any: 'value' },
      query: {},
      params: {},
      originalUrl: '/api/resumes',
      method: 'POST',
    };

    const schemaThatThrows = {
      body: {
        safeParse: () => {
          throw new Error('unexpected parse failure');
        },
      },
    };

    const err = await runMiddleware(validateRequest(schemaThatThrows as never), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('parses query and params when schemas are valid', async () => {
    const schema = {
      query: z.object({
        page: z.coerce.number().int().positive(),
      }),
      params: z.object({
        resumeId: z.string().uuid(),
      }),
    };

    const request: Record<string, unknown> = {
      body: {},
      query: { page: '2' },
      params: { resumeId: '550e8400-e29b-41d4-a716-446655440000' },
    };

    const err = await runMiddleware(validateRequest(schema), request);
    expect(err).toBeUndefined();
    expect(request.parsedQuery).toEqual({ page: 2 });
    expect(request.parsedParams).toEqual({ resumeId: '550e8400-e29b-41d4-a716-446655440000' });
  });

  it('maps zod issues with empty paths to HTTP 400', async () => {
    const schema = {
      body: z.object({}).refine(() => false, { message: 'global body rule failed' }),
    };

    const request = {
      body: {},
      query: {},
      params: {},
      originalUrl: '/api/test',
      method: 'POST',
    };

    const err = await runMiddleware(validateRequest(schema), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
    const payload = response.json.mock.calls[0][0];
    expect(JSON.stringify(payload.error)).toContain('global body rule failed');
  });

  it('maps invalid query payload to HTTP 400', async () => {
    const schema = {
      query: z.object({
        page: z.coerce.number().int().positive(),
      }),
    };

    const request = {
      body: {},
      query: { page: '0' },
      params: {},
      originalUrl: '/api/test',
      method: 'GET',
    };

    const err = await runMiddleware(validateRequest(schema), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(JSON.stringify(response.json.mock.calls[0][0].error)).toContain(
      'page: Too small: expected number to be >0'
    );
  });

  it('maps invalid params payload to HTTP 400', async () => {
    const schema = {
      params: z.object({
        userId: z.string().uuid(),
      }),
    };

    const request = {
      body: {},
      query: {},
      params: { userId: 'not-a-uuid' },
      originalUrl: '/api/users/not-a-uuid',
      method: 'GET',
    };

    const err = await runMiddleware(validateRequest(schema), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(JSON.stringify(response.json.mock.calls[0][0].error)).toContain(
      'userId: Invalid UUID'
    );
  });
});
