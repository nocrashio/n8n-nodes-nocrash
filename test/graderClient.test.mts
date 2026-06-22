import { describe, it, expect, vi } from "vitest";
import { gradeBatch, GRADER_BATCH_CAP } from "../nodes/Nocrash/shared/graderClient";

/**
 * graderClient unit tests against a MOCKED n8n request helper.
 *
 * The real Grader endpoint (POST /api/v1/grade/batch, issue #2319) is built in
 * parallel and not yet deployed. We assert the client posts to the correct URL
 * with the agreed body shape, returns the agreed response contract, and caps
 * the batch at GRADER_BATCH_CAP.
 */

/** Minimal fake IExecuteFunctions exposing the helper the client calls. */
function fakeCtxWithResponse(response: unknown) {
  const httpRequest = vi.fn().mockResolvedValue(response);
  const ctx = {
    helpers: {
      // n8n helpers are invoked via `.call(ctx, options)`.
      httpRequest: Object.assign(
        function (this: unknown, options: unknown) {
          return httpRequest(options);
        },
        { call: (_ctx: unknown, options: unknown) => httpRequest(options) },
      ),
    },
  };
  return { ctx, httpRequest };
}

const SAMPLE_RESPONSE = {
  instance_score: 72,
  instance_band: "yellow",
  instance_band_label: "Needs a look",
  workflow_count: 2,
  workflows: [
    { name: "A", score: 88, band: "green", top_issue: "No error handling" },
    { name: "B", score: 56, band: "yellow", top_issue: "No retry on HTTP" },
  ],
  capped: false,
  cap_reason: null,
};

describe("gradeBatch", () => {
  it("POSTs to /api/v1/grade/batch with the agreed body shape", async () => {
    const { ctx, httpRequest } = fakeCtxWithResponse(SAMPLE_RESPONSE);
    const workflows = [{ id: "1", name: "A" }];

    await gradeBatch(ctx as never, "https://nocrash.io", workflows);

    expect(httpRequest).toHaveBeenCalledTimes(1);
    const options = httpRequest.mock.calls[0][0] as Record<string, unknown>;
    expect(options.method).toBe("POST");
    expect(options.url).toBe("https://nocrash.io/api/v1/grade/batch");
    expect(options.json).toBe(true);
    expect(options.body).toEqual({ workflows });
  });

  it("returns the agreed Grader response contract", async () => {
    const { ctx } = fakeCtxWithResponse(SAMPLE_RESPONSE);
    const result = await gradeBatch(ctx as never, "https://nocrash.io", [{ id: "1" }]);
    expect(result.instance_score).toBe(72);
    expect(result.instance_band_label).toBe("Needs a look");
    expect(result.workflows[1].top_issue).toBe("No retry on HTTP");
  });

  it("normalizes a trailing slash on the base URL", async () => {
    const { ctx, httpRequest } = fakeCtxWithResponse(SAMPLE_RESPONSE);
    await gradeBatch(ctx as never, "https://nocrash.io/", [{ id: "1" }]);
    const options = httpRequest.mock.calls[0][0] as Record<string, unknown>;
    expect(options.url).toBe("https://nocrash.io/api/v1/grade/batch");
  });

  it("caps the batch at GRADER_BATCH_CAP", async () => {
    const { ctx, httpRequest } = fakeCtxWithResponse(SAMPLE_RESPONSE);
    const many = Array.from({ length: GRADER_BATCH_CAP + 10 }, (_v, i) => ({ id: String(i) }));
    await gradeBatch(ctx as never, "https://nocrash.io", many);
    const options = httpRequest.mock.calls[0][0] as { body: { workflows: unknown[] } };
    expect(options.body.workflows).toHaveLength(GRADER_BATCH_CAP);
  });
});
