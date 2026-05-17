import { describe, expect, it } from "vitest";
import {
    uintCV,
    stringUtf8CV,
    stringAsciiCV,
    boolCV,
    principalCV,
    tupleCV,
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const owner = accounts.get("wallet_1")!;
const renter = accounts.get("wallet_2")!;
const other = accounts.get("wallet_3")!;

const REVIEWS = "spot-reviews";

function submitReview(bookingId: number, spotId: number, rating: number, comment: string, sender: string) {
    return simnet.callPublicFn(
        REVIEWS,
        "submit-review",
        [
            uintCV(bookingId),
            uintCV(spotId),
            uintCV(rating),
            stringUtf8CV(comment),
        ],
        sender,
    );
}

function getSpotRating(spotId: number) {
    return simnet.callReadOnlyFn(REVIEWS, "get-spot-rating", [uintCV(spotId)], renter).result;
}

describe("spot-reviews", () => {
    it("submits a review and exposes it via get-review", () => {
        const { result } = submitReview(1, 1, 5, "great spot", renter);
        expect(result).toBeOk(uintCV(1));

        const review = simnet.callReadOnlyFn(REVIEWS, "get-review", [uintCV(1)], renter).result;
        expect(review).toBeSome(tupleCV({
            "booking-id": uintCV(1),
            "reviewer": principalCV(renter),
            "spot-id": uintCV(1),
            "rating": uintCV(5),
            "comment": stringUtf8CV("great spot"),
        }));
    });

    it("rejects ratings outside the 1..5 range", () => {
        const zero = submitReview(1, 1, 0, "bad", renter);
        const six = submitReview(2, 1, 6, "bad", renter);
        expect(zero.result).toBeErr(uintCV(102)); // err-invalid-rating
        expect(six.result).toBeErr(uintCV(102));
    });

    it("rejects a second review for the same booking", () => {
        submitReview(1, 1, 5, "first", renter);
        const second = submitReview(1, 1, 4, "second", other);
        expect(second.result).toBeErr(uintCV(101)); // err-review-already-exists
    });

    it("computes a running average for the spot, scaled by 10", () => {
        submitReview(1, 1, 5, "a", renter); // average = 50 (5.0)
        submitReview(2, 1, 3, "b", other);  // (5+3)/2 = 4.0 → 40

        expect(getSpotRating(1)).toBeSome(tupleCV({
            "total-rating": uintCV(8),
            "review-count": uintCV(2),
            "average": uintCV(40),
        }));
    });

    it("returns none for an unrated spot", () => {
        expect(getSpotRating(999)).toBeNone();
    });

    it("integration: book → complete → review updates the spot's rating", () => {
        // Set up the full graph: users registered, car registered, spot listed.
        simnet.callPublicFn("user-registry", "register-user", [], owner);
        simnet.callPublicFn("user-registry", "register-user", [], renter);
        simnet.callPublicFn(
            "car-registry",
            "register-car",
            [
                stringAsciiCV("ABC-1"),
                stringAsciiCV("Make"),
                stringAsciiCV("Model"),
                uintCV(2020),
            ],
            renter,
        );
        simnet.callPublicFn(
            "parking-spot",
            "list-spot",
            [stringUtf8CV("Downtown"), uintCV(10)],
            owner,
        );

        // Book the spot.
        const start = simnet.burnBlockHeight + 2;
        const end = start + 4;
        const booking = simnet.callPublicFn(
            "booking",
            "create-booking",
            [uintCV(1), uintCV(1), uintCV(start), uintCV(end)],
            renter,
        );
        expect(booking.result).toBeOk(uintCV(1));

        // Advance past end so escrow release-time passes; owner completes.
        simnet.mineEmptyBurnBlocks(end + 5);
        const complete = simnet.callPublicFn(
            "booking",
            "complete-booking",
            [uintCV(1)],
            owner,
        );
        expect(complete.result).toBeOk(boolCV(true));

        // Renter leaves a 4-star review tied to booking 1 / spot 1.
        const review = submitReview(1, 1, 4, "good", renter);
        expect(review.result).toBeOk(uintCV(1));

        // Spot rating updated: total=4, count=1, average=40 (4.0 scaled).
        expect(getSpotRating(1)).toBeSome(tupleCV({
            "total-rating": uintCV(4),
            "review-count": uintCV(1),
            "average": uintCV(40),
        }));
    });
});
