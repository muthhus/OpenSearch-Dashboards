/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
}));

import { RouteOptions } from '@hapi/hapi';
import { OpenSearchDashboardsRequest } from './request';
import { httpServerMock } from '../http_server.mocks';
import { schema } from '@osd/config-schema';

describe('OpenSearchDashboardsRequest', () => {
  describe('id property', () => {
    it('uses the request.app.requestId property if present', () => {
      const request = httpServerMock.createRawRequest({
        app: { requestId: 'fakeId' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.id).toEqual('fakeId');
    });

    it('generates a new UUID if request.app property is not present', () => {
      // Undefined app property
      const request = httpServerMock.createRawRequest({
        app: undefined,
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.id).toEqual('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    });

    it('generates a new UUID if request.app.requestId property is not present', () => {
      // Undefined app.requestId property
      const request = httpServerMock.createRawRequest({
        app: {},
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.id).toEqual('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    });
  });

  describe('uuid property', () => {
    it('uses the request.app.requestUuid property if present', () => {
      const request = httpServerMock.createRawRequest({
        app: { requestUuid: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.uuid).toEqual('123e4567-e89b-12d3-a456-426614174000');
    });

    it('generates a new UUID if request.app property is not present', () => {
      // Undefined app property
      const request = httpServerMock.createRawRequest({
        app: undefined,
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.uuid).toEqual('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    });

    it('generates a new UUID if request.app.requestUuid property is not present', () => {
      // Undefined app.requestUuid property
      const request = httpServerMock.createRawRequest({
        app: {},
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.uuid).toEqual('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    });
  });

  describe('get all headers', () => {
    it('returns all headers', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', authorization: 'token' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.headers).toEqual({
        custom: 'one',
        authorization: 'token',
      });
    });
  });

  describe('headers property', () => {
    it('provides a frozen copy of request headers', () => {
      const rawRequestHeaders = { custom: 'one' };
      const request = httpServerMock.createRawRequest({
        headers: rawRequestHeaders,
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);

      expect(opensearchDashboardsRequest.headers).toEqual({ custom: 'one' });
      expect(opensearchDashboardsRequest.headers).not.toBe(rawRequestHeaders);
      expect(Object.isFrozen(opensearchDashboardsRequest.headers)).toBe(true);
    });

    it.skip("doesn't expose authorization header by default", () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', authorization: 'token' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.headers).toEqual({
        custom: 'one',
      });
    });

    it('exposes authorization header if secured = false', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', authorization: 'token' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(
        request,
        undefined,
        false
      );
      expect(opensearchDashboardsRequest.headers).toEqual({
        custom: 'one',
        authorization: 'token',
      });
    });
  });

  describe('isSytemApi property', () => {
    it('is false when no osd-system-request header is set', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.isSystemRequest).toBe(false);
    });

    it('is true when osd-system-request header is set to true', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', 'osd-system-request': 'true' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.isSystemRequest).toBe(true);
    });

    it('is false when osd-system-request header is set to false', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', 'osd-system-request': 'false' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.isSystemRequest).toBe(false);
    });

    // Remove support for osd-system-api header in 8.x. Only used by legacy platform.
    it('is false when no osd-system-api header is set', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.isSystemRequest).toBe(false);
    });

    it('is true when osd-system-api header is set to true', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', 'osd-system-api': 'true' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.isSystemRequest).toBe(true);
    });

    it('is false when osd-system-api header is set to false', () => {
      const request = httpServerMock.createRawRequest({
        headers: { custom: 'one', 'osd-system-api': 'false' },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);
      expect(opensearchDashboardsRequest.isSystemRequest).toBe(false);
    });
  });

  describe('route.options.authRequired property', () => {
    it('handles required auth: undefined', () => {
      const auth: RouteOptions['auth'] = undefined;
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            auth,
          },
        },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);

      expect(opensearchDashboardsRequest.route.options.authRequired).toBe(true);
    });
    it('handles required auth: false', () => {
      const auth: RouteOptions['auth'] = false;
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            // @ts-expect-error According to types/hapi__hapi, `auth` can't be a boolean, but it can according to the @hapi/hapi source (https://github.com/hapijs/hapi/blob/v20.2.1/lib/route.js#L134)
            auth,
          },
        },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);

      expect(opensearchDashboardsRequest.route.options.authRequired).toBe(false);
    });
    it('handles required auth: { mode: "required" }', () => {
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            auth: { mode: 'required' },
          },
        },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);

      expect(opensearchDashboardsRequest.route.options.authRequired).toBe(true);
    });

    it('handles required auth: { mode: "optional" }', () => {
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            auth: { mode: 'optional' },
          },
        },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);

      expect(opensearchDashboardsRequest.route.options.authRequired).toBe('optional');
    });

    it('handles required auth: { mode: "try" } as "optional"', () => {
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            auth: { mode: 'try' },
          },
        },
      });
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request);

      expect(opensearchDashboardsRequest.route.options.authRequired).toBe('optional');
    });

    it('throws on auth: strategy name', () => {
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            auth: { strategies: ['session'] },
          },
        },
      });

      expect(() => OpenSearchDashboardsRequest.from(request)).toThrowErrorMatchingInlineSnapshot(
        `"unexpected authentication options: {\\"strategies\\":[\\"session\\"]} for route: /"`
      );
    });

    it('throws on auth: { mode: unexpected mode }', () => {
      const request = httpServerMock.createRawRequest({
        route: {
          settings: {
            auth: { mode: undefined },
          },
        },
      });

      expect(() => OpenSearchDashboardsRequest.from(request)).toThrowErrorMatchingInlineSnapshot(
        `"unexpected authentication options: {} for route: /"`
      );
    });
  });

  describe('RouteSchema type inferring', () => {
    it('should work with config-schema', () => {
      const body = Buffer.from('body!');
      const request = {
        ...httpServerMock.createRawRequest({
          params: { id: 'params' },
          query: { search: 'query' },
        }),
        payload: body, // Set outside because the mock is using `merge` by lodash and breaks the Buffer into arrays
      } as any;
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request, {
        params: schema.object({ id: schema.string() }),
        query: schema.object({ search: schema.string() }),
        body: schema.buffer(),
      });
      expect(opensearchDashboardsRequest.params).toStrictEqual({ id: 'params' });
      expect(opensearchDashboardsRequest.params.id.toUpperCase()).toEqual('PARAMS'); // infers it's a string
      expect(opensearchDashboardsRequest.query).toStrictEqual({ search: 'query' });
      expect(opensearchDashboardsRequest.query.search.toUpperCase()).toEqual('QUERY'); // infers it's a string
      expect(opensearchDashboardsRequest.body).toEqual(body);
      expect(opensearchDashboardsRequest.body.byteLength).toBeGreaterThan(0); // infers it's a buffer
    });

    it('should work with ValidationFunction', () => {
      const body = Buffer.from('body!');
      const request = {
        ...httpServerMock.createRawRequest({
          params: { id: 'params' },
          query: { search: 'query' },
        }),
        payload: body, // Set outside because the mock is using `merge` by lodash and breaks the Buffer into arrays
      } as any;
      const opensearchDashboardsRequest = OpenSearchDashboardsRequest.from(request, {
        params: schema.object({ id: schema.string() }),
        query: schema.object({ search: schema.string() }),
        body: (data, { ok, badRequest }) => {
          if (Buffer.isBuffer(data)) {
            return ok(data);
          } else {
            return badRequest('It should be a Buffer', []);
          }
        },
      });
      expect(opensearchDashboardsRequest.params).toStrictEqual({ id: 'params' });
      expect(opensearchDashboardsRequest.params.id.toUpperCase()).toEqual('PARAMS'); // infers it's a string
      expect(opensearchDashboardsRequest.query).toStrictEqual({ search: 'query' });
      expect(opensearchDashboardsRequest.query.search.toUpperCase()).toEqual('QUERY'); // infers it's a string
      expect(opensearchDashboardsRequest.body).toEqual(body);
      expect(opensearchDashboardsRequest.body.byteLength).toBeGreaterThan(0); // infers it's a buffer
    });
  });
});
