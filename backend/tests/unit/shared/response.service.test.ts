import responseService from '@dist/modules/shared/presentation/response.service';

describe('response.service', () => {
  const buildResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  it('returns success response with default status', () => {
    const res = buildResponse();

    responseService.success(res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: undefined,
      data: undefined,
    });
  });

  it('returns success response with custom payload', () => {
    const res = buildResponse();

    responseService.success(res as never, {
      statusCode: 201,
      message: 'Created',
      data: { id: '1' },
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: '1' },
    });
  });

  it('returns paginated response with hasNext true and hasPrev false', () => {
    const res = buildResponse();

    responseService.paginated(res as never, {
      message: 'Fetched',
      data: [{ id: '1' }],
      metadata: {
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Fetched',
      data: {
        data: [{ id: '1' }],
        metadata: {
          total: 15,
          page: 1,
          limit: 10,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      },
    });
  });

  it('returns paginated response with hasNext false and hasPrev true', () => {
    const res = buildResponse();

    responseService.paginated(res as never, {
      statusCode: 206,
      message: 'Fetched',
      data: [{ id: '2' }],
      metadata: {
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      },
    });

    expect(res.status).toHaveBeenCalledWith(206);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Fetched',
      data: {
        data: [{ id: '2' }],
        metadata: {
          total: 15,
          page: 2,
          limit: 10,
          totalPages: 2,
          hasNext: false,
          hasPrev: true,
        },
      },
    });
  });
});
