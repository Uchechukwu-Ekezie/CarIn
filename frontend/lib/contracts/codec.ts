/**
 * Thin wrappers around @stacks/transactions Clarity value (de)serialization.
 *
 * These exist so the contract modules and hooks don't have to import
 * @stacks/transactions directly (and so the rest of the codebase has
 * a single, ergonomic surface for moving between Clarity values and
 * plain JS).
 */

import {
    cvToValue,
    type ClarityValue,
    type TupleCV,
    type SomeCV,
    type ResponseOkCV,
    type ResponseErrorCV,
} from "@stacks/transactions";

/**
 * Unwrap a `(response ok err)` value. Returns the inner value if ok,
 * throws an Error tagged with the error code if err.
 *
 * @stacks/transactions returns ClarityValue from read-only calls; this
 * helper turns that into either the JS value you want or a thrown
 * Error so call sites can use try/catch or .then().
 */
export function unwrapResponse<T = unknown>(cv: ClarityValue): T {
    if (cv.type === "ok") {
        return cvToValue((cv as ResponseOkCV).value) as T;
    }
    if (cv.type === "err") {
        const errValue = cvToValue((cv as ResponseErrorCV).value);
        throw new ContractError(errValue);
    }
    // Some read-only functions return a bare value (not wrapped in response)
    return cvToValue(cv) as T;
}

/**
 * Unwrap a `(optional T)` value. Returns the inner JS value if some,
 * null if none.
 */
export function unwrapOptional<T = unknown>(cv: ClarityValue): T | null {
    if (cv.type === "some") {
        return cvToValue((cv as SomeCV).value) as T;
    }
    if (cv.type === "none") {
        return null;
    }
    // Caller passed something that wasn't an optional — treat as a plain value.
    return cvToValue(cv) as T;
}

/**
 * Convenience: unwrap an `(optional (tuple ...))` returning either the
 * tuple as a plain JS object or null.
 */
export function unwrapOptionalTuple(cv: ClarityValue): Record<string, unknown> | null {
    return unwrapOptional<Record<string, unknown>>(cv);
}

/**
 * Convert a TupleCV directly to a plain object. Useful when the
 * read-only function returns a bare tuple, not wrapped in optional or
 * response.
 */
export function tupleToObject(cv: TupleCV): Record<string, unknown> {
    return cvToValue(cv) as Record<string, unknown>;
}

/**
 * Error type thrown by `unwrapResponse` when the Clarity response is
 * an `err`. The numeric `code` is the value that came back from the
 * contract — match it against the contract's `define-constant
 * err-... (err uXXX)` codes to render a useful message.
 */
export class ContractError extends Error {
    code: bigint | number | string;

    constructor(code: bigint | number | string, message?: string) {
        super(message ?? `Contract returned err ${String(code)}`);
        this.name = "ContractError";
        this.code = code;
    }
}

/**
 * Convert microSTX (1 STX = 1_000_000 µSTX) to a decimal STX string.
 */
export function microStxToStx(microStx: bigint | number | string): string {
    const value = BigInt(microStx);
    const stx = Number(value) / 1_000_000;
    return stx.toFixed(6).replace(/\.?0+$/, "");
}

/**
 * Convert a decimal STX string ("1.5") to microSTX (1_500_000n).
 */
export function stxToMicroStx(stx: string | number): bigint {
    const asNumber = typeof stx === "string" ? Number(stx) : stx;
    if (!Number.isFinite(asNumber) || asNumber < 0) {
        throw new Error(`invalid STX amount: ${stx}`);
    }
    return BigInt(Math.round(asNumber * 1_000_000));
}
