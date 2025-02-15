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

import { format as formatUrl } from 'url';
import { stringify, ParsedQuery } from 'query-string';
import { parseUrl, parseUrlHash } from './parse';
import { url as urlUtils } from '../../../common';

export function replaceUrlQuery(
  rawUrl: string,
  queryReplacer: (query: ParsedQuery) => ParsedQuery
) {
  const url = parseUrl(rawUrl);
  // @ts-expect-error
  const newQuery = queryReplacer(url.query || {});
  const searchQueryString = stringify(urlUtils.encodeQuery(newQuery), {
    sort: false,
    encode: false,
  });
  if (!url.search && !searchQueryString) return rawUrl; // nothing to change. return original url
  return formatUrl({
    ...url,
    search: searchQueryString,
  });
}

export function replaceUrlHashQuery(
  rawUrl: string,
  queryReplacer: (query: ParsedQuery) => ParsedQuery
) {
  const url = parseUrl(rawUrl);
  const hash = parseUrlHash(rawUrl);
  // @ts-expect-error
  const newQuery = queryReplacer(hash?.query || {});
  const searchQueryString = stringify(urlUtils.encodeQuery(newQuery), {
    sort: false,
    encode: false,
  });

  if ((!hash || !hash.search) && !searchQueryString) return rawUrl; // nothing to change. return original url
  return formatUrl({
    ...url,
    hash: formatUrl({
      pathname: hash?.pathname || '',
      search: searchQueryString,
    }),
  });
}
