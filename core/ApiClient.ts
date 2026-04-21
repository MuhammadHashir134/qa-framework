// ─────────────────────────────────────────────────────────
// ApiClient — universal REST API helper
// Use in any story that needs API-level testing
// ─────────────────────────────────────────────────────────

import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { HTTP_STATUS, TIMEOUTS } from '../config/constants';

export class ApiClient {
  private request: APIRequestContext;
  private baseURL:  string;
  private headers:  Record<string, string>;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL  = baseURL;
    this.headers  = { 'Content-Type': 'application/json' };
  }

  // ── Auth ───────────────────────────────────────────────

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  setApiKey(key: string) {
    this.headers['X-API-Key'] = key;
  }

  clearAuth() {
    delete this.headers['Authorization'];
    delete this.headers['X-API-Key'];
  }

  // ── HTTP Methods ───────────────────────────────────────

  async get(endpoint: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      params,
      timeout: TIMEOUTS.api,
    });
  }

  async post(endpoint: string, body: unknown): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      data: body,
      timeout: TIMEOUTS.api,
    });
  }

  async put(endpoint: string, body: unknown): Promise<APIResponse> {
    return this.request.put(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      data: body,
      timeout: TIMEOUTS.api,
    });
  }

  async patch(endpoint: string, body: unknown): Promise<APIResponse> {
    return this.request.patch(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      data: body,
      timeout: TIMEOUTS.api,
    });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
      timeout: TIMEOUTS.api,
    });
  }

  // ── Assertions ─────────────────────────────────────────

  async assertStatus(response: APIResponse, status: number) {
    expect(response.status()).toBe(status);
  }

  async assertOK(response: APIResponse) {
    expect(response.ok()).toBeTruthy();
  }

  async assertBodyContains(response: APIResponse, key: string) {
    const body = await response.json();
    expect(body).toHaveProperty(key);
  }

  async assertBodyValue(response: APIResponse, key: string, value: unknown) {
    const body = await response.json();
    expect(body[key]).toEqual(value);
  }

  async getJson(response: APIResponse): Promise<Record<string, unknown>> {
    return response.json();
  }

  // ── Shortcuts ──────────────────────────────────────────

  async getAndAssertOK(endpoint: string) {
    const res = await this.get(endpoint);
    await this.assertOK(res);
    return res;
  }

  async postAndAssertCreated(endpoint: string, body: unknown) {
    const res = await this.post(endpoint, body);
    await this.assertStatus(res, HTTP_STATUS.CREATED);
    return res;
  }
}
