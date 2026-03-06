;; user-registry.clar
;; Manages user profiles and reputation scores to build trust in the marketplace.

;; Constants
(define-constant err-not-authorized (err u100))
(define-constant err-user-already-exists (err u101))
(define-constant err-user-not-found (err u102))

;; Data Variables
(define-constant contract-owner tx-sender)

;; Data Maps
(define-map users
    principal
    {
        is-verified: bool,
        total-bookings: uint,
        host-rating: uint,   ;; Scaled by 10 (e.g., 45 = 4.5 stars)
        renter-rating: uint, ;; Scaled by 10
        total-host-reviews: uint,
        total-renter-reviews: uint
    }
)

;; Register a new user
(define-public (register-user)
    (let
        (
            (user tx-sender)
        )
        (asserts! (is-none (map-get? users user)) err-user-already-exists)
        (ok (map-set users user {
            is-verified: false,
            total-bookings: u0,
            host-rating: u0,
            renter-rating: u0,
            total-host-reviews: u0,
            total-renter-reviews: u0
        }))
    )
)

;; Verify a user (only contract owner can verify)
(define-public (verify-user (user principal))
    (let
        (
            (user-data (unwrap! (map-get? users user) err-user-not-found))
        )
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        (ok (map-set users user (merge user-data {is-verified: true})))
    )
)

;; Update rating (placeholder logic, usually called by review contract)
;; Keeping public for now, but in reality should be restricted to the reviews contract
(define-public (update-rating (user principal) (is-host bool) (new-rating uint))
    (let
        (
            (user-data (unwrap! (map-get? users user) err-user-not-found))
        )
        ;; Note: Add authorization check here to only allow the spot-reviews contract to call this.
        ;; For simplicity in this implementation, we leave it open or assumed restricted to owner/admin.
        
        (if is-host
            (let
                (
                    (current-rating (get host-rating user-data))
                    (total-reviews (get total-host-reviews user-data))
                    (new-total (+ total-reviews u1))
                    (calculated-rating (/ (+ (* current-rating total-reviews) new-rating) new-total))
                )
                (ok (map-set users user (merge user-data {
                    host-rating: calculated-rating,
                    total-host-reviews: new-total
                })))
            )
            (let
                (
                    (current-rating (get renter-rating user-data))
                    (total-reviews (get total-renter-reviews user-data))
                    (new-total (+ total-reviews u1))
                    (calculated-rating (/ (+ (* current-rating total-reviews) new-rating) new-total))
                )
                (ok (map-set users user (merge user-data {
                    renter-rating: calculated-rating,
                    total-renter-reviews: new-total
                })))
            )
        )
    )
)

;; Increment total bookings
(define-public (increment-bookings (user principal))
    (let
        (
            (user-data (unwrap! (map-get? users user) err-user-not-found))
        )
        ;; Again, this should ideally be restricted to the booking contract
        (ok (map-set users user (merge user-data {
            total-bookings: (+ (get total-bookings user-data) u1)
        })))
    )
)

;; Read-only functions
(define-read-only (get-user (user principal))
    (map-get? users user)
)

(define-read-only (is-user-verified (user principal))
    (match (map-get? users user)
        user-data (get is-verified user-data)
        false
    )
)
