import validateRequest from '@dist/middleware/validate-request.middleware';
import resumeDTO from '@dist/modules/resume/presentation/resume.dto';
import { runErrorHandler, runMiddleware } from '../helpers/http-middleware.helper';

describe('resume validation integration', () => {
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

  it('returns HTTP 400 when update resume payload exceeds max sections', async () => {
    const maxSections = Number(process.env.MAX_RESUME_SECTIONS ?? 20);
    const request = {
      body: {
        data: buildResumeData(maxSections + 1),
      },
      query: {},
      params: { resumeId: '7de625ab-9cf0-44f9-a9f5-f69e828eb963' },
      originalUrl: '/api/resumes/7de625ab-9cf0-44f9-a9f5-f69e828eb963',
      method: 'PATCH',
    };

    const err = await runMiddleware(validateRequest(resumeDTO.updateResume), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid get-export-status params', async () => {
    const request: Record<string, unknown> = {
      body: {},
      query: {},
      params: {
        exportId: '7de625ab-9cf0-44f9-a9f5-f69e828eb963',
      },
    };

    const err = await runMiddleware(validateRequest(resumeDTO.exportStatus), request);
    expect(err).toBeUndefined();
    expect(request.parsedParams).toBeDefined();
  });

  it('returns HTTP 400 for invalid export-status params', async () => {
    const request = {
      body: {
        resumeId: '7de625ab-9cf0-44f9-a9f5-f69e828eb963',
      },
      query: {},
      params: { exportId: 'invalid-uuid' },
      originalUrl: '/api/resumes/exports/invalid-uuid/status',
      method: 'GET',
    };

    const err = await runMiddleware(validateRequest(resumeDTO.exportStatus), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns HTTP 400 for unknown create templateId', async () => {
    const request = {
      body: {
        name: 'My Resume',
        templateId: 'unknown-template',
        data: buildResumeData(1),
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
    expect(JSON.stringify(response.json.mock.calls[0][0].error)).toContain('Invalid templateId');
  });

  it('returns HTTP 400 for unknown update templateId', async () => {
    const request = {
      body: {
        templateId: 'unknown-template',
      },
      query: {},
      params: { resumeId: '7de625ab-9cf0-44f9-a9f5-f69e828eb963' },
      originalUrl: '/api/resumes/7de625ab-9cf0-44f9-a9f5-f69e828eb963',
      method: 'PATCH',
    };

    const err = await runMiddleware(validateRequest(resumeDTO.updateResume), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(JSON.stringify(response.json.mock.calls[0][0].error)).toContain('Invalid templateId');
  });
});
