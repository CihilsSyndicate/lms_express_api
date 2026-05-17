export interface CursorPaginationQuery {
  limit?: number;
  cursor?: string;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
}

export const parsePaginationQuery = (
  query: any,
): { limit: number; cursor?: string } => {
  let limit = 10;
  if (query.limit) {
    const parsedLimit = parseInt(query.limit as string, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, 100);
    } else {
      throw new Error('Invalid limit parameter');
    }
  }
  return { limit, cursor: query.cursor as string };
};

export const encodeCursor = (payload: any): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const decodeCursor = (cursor: string): any => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch (e) {
    throw new Error('Invalid cursor');
  }
};

export const buildCursorWhere = (
  cursorPayload: any,
  cursorKey: string = 'id',
  createdAtKey: string = 'createdAt',
) => {
  if (!cursorPayload) return {};

  if (cursorPayload[createdAtKey] !== undefined) {
    return {
      OR: [
        {
          [createdAtKey]: {
            lt: new Date(cursorPayload[createdAtKey]),
          },
        },
        {
          [createdAtKey]: {
            equals: new Date(cursorPayload[createdAtKey]),
          },
          [cursorKey]: {
            lt: cursorPayload[cursorKey],
          },
        },
      ],
    };
  }

  return {
    [cursorKey]: {
      lt: cursorPayload[cursorKey],
    },
  };
};

export const buildCursorPaginatedResponse = <T>(
  items: T[],
  limit: number,
  getCursorPayload: (item: T) => any,
): CursorPaginatedResponse<T> => {
  const hasNextPage = items.length > limit;
  const paginatedItems = hasNextPage ? items.slice(0, limit) : items;

  let next_cursor = null;
  if (hasNextPage && paginatedItems.length > 0) {
    const lastItem = paginatedItems[paginatedItems.length - 1];
    next_cursor = encodeCursor(getCursorPayload(lastItem as T));
  }

  return {
    items: paginatedItems,
    next_cursor,
  };
};
