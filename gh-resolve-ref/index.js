/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

 const { resolve, ResolveError, NetworkError } = require('@adobe/gh-resolve-ref');

/**
 * This is the main function. It resolves the specified reference to the corresponding
 * sha of the HEAD commit at `ref`.
 *
 * If the specified repository is private you have to provide a valid GitHub access token
 * either via `x-github-token` header or `GITHUB_TOKEN` action parameter.
 *
 * @param {Object} context The function context
 * @param {Object} req The request object
 * @param {Object} req.query The query parameters
 * @param {string} req.query.owner GitHub organization or user
 * @param {string} req.query.repo GitHub repository name
 * @param {string} [req.query.ref=<default branch>] git reference (branch or tag name)
 * @returns {Promise<object>} result
 * @returns {string} result.sha the sha of the HEAD commit at `ref`
 * @returns {string} result.fqRef the fully qualified name of `ref`
 *                                (e.g. `refs/heads/<branch>` or `refs/tags/<tag>`)
 */
module.exports = async (context, req) => {

  const {
      owner,
      repo,
      ref,
      GITHUB_TOKEN,
    } = req.query;
  
    const token = GITHUB_TOKEN || req.headers['x-github-token'];

    const ts0 = Date.now();

    return resolve({
      owner,
      repo,
      ref,
      token,
    })
      .then((result) => {
        const ts1 = Date.now();
        context.log.info(`duration: ${ts1 - ts0}ms`);

        if (result) {
          return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: result,
          };
        } else {
          return {
            status: 404,
            body: 'ref not found',
          };
        }
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          return {
            status: 400,
            body: 'owner and repo are mandatory parameters',
          };
        } else if (err instanceof NetworkError) {
          // (temporary?) network issue
          return {
            status: 503, // service unavailable
            body: `failed to fetch git repo info: ${err.message}`,
          };
        } else /* istanbul ignore next */ if (err instanceof ResolveError) {
          const { status, message } = err;
          let resultStatus = 500;
          if (status >= 500 && status <= 599) {
            // bad gateway
            resultStatus = 502;
          } else /* istanbul ignore next */ if (status === 404) {
            // repo not found
            resultStatus = 404;
          }
          return {
            status: resultStatus,
            body: `failed to fetch git repo info (status: ${status}, message: ${message})`,
          };
        } else {
          /* istanbul ignore next */
          return {
            status: 500,
            body: `failed to fetch git repo info: ${err})`,
          };
        }
      });
}