;; spot-reviews.clar
;; Allows users to leave 1-5 star reviews after a completed booking

;; Constants
(define-constant err-review-already-exists (err u101))
(define-constant err-invalid-rating (err u102))

;; Data Variables
(define-data-var review-counter uint u0)

;; Data Maps
(define-map reviews
    uint
    {
        booking-id: uint,
        reviewer: principal,
        spot-id: uint,
        rating: uint, ;; 1 to 5
        comment: (string-utf8 250)
    }
)

;; Keep track if a booking has been reviewed to prevent double-reviews
(define-map booking-reviews uint uint)

;; Spot average rating
(define-map spot-ratings
    uint
    {
        total-rating: uint,
        review-count: uint,
        average: uint ;; Scaled by 10 (e.g., 45 = 4.5)
    }
)

;; Submit a review
(define-public (submit-review (booking-id uint) (spot-id uint) (rating uint) (comment (string-utf8 250)))
    (let
        (
            (review-id (+ (var-get review-counter) u1))
            ;; Normally we verify the caller was part of the booking using booking contract
            ;; (booking (unwrap! (contract-call? .booking get-booking booking-id) err-not-authorized))
        )
        ;; Check rating bounds 1-5
        (asserts! (and (>= rating u1) (<= rating u5)) err-invalid-rating)
        
        ;; Check if booking has already been reviewed by this person
        (asserts! (is-none (map-get? booking-reviews booking-id)) err-review-already-exists)

        (map-set reviews review-id {
            booking-id: booking-id,
            reviewer: tx-sender,
            spot-id: spot-id,
            rating: rating,
            comment: comment
        })

        (map-set booking-reviews booking-id review-id)
        
        ;; Update spot average
        (let
            (
                (current-rating (default-to {total-rating: u0, review-count: u0, average: u0} (map-get? spot-ratings spot-id)))
                (new-total (+ (get total-rating current-rating) rating))
                (new-count (+ (get review-count current-rating) u1))
                (new-average (/ (* new-total u10) new-count))
            )
            (map-set spot-ratings spot-id {
                total-rating: new-total,
                review-count: new-count,
                average: new-average
            })
        )

        ;; Could optionally update the host's global rating in user-registry here
        ;; (try! (contract-call? .user-registry update-rating host true rating))

        (var-set review-counter review-id)
        (ok review-id)
    )
)

;; Read-only functions
(define-read-only (get-review (review-id uint))
    (map-get? reviews review-id)
)

(define-read-only (get-spot-rating (spot-id uint))
    (map-get? spot-ratings spot-id)
)
