;; parking-spot.clar
;; Manages parking spot listings and availability

;; Constants
(define-constant err-not-owner (err u100))
(define-constant err-invalid-price (err u101))
(define-constant err-spot-not-found (err u102))

;; Data Variables
(define-data-var spot-counter uint u0)

;; Data Maps
(define-map spots
    uint
    {
        owner: principal,
        location: (string-utf8 100),
        price-per-hour: uint,
        is-available: bool,
        created-at: uint
    }
)

;; Register a new parking spot
(define-public (list-spot (location (string-utf8 100)) (price-per-hour uint))
    (let
        (
            (spot-id (+ (var-get spot-counter) u1))
        )
        (asserts! (> price-per-hour u0) err-invalid-price)
        
        (map-set spots spot-id {
            owner: tx-sender,
            location: location,
            price-per-hour: price-per-hour,
            is-available: true,
            created-at: burn-block-height
        })
        
        (var-set spot-counter spot-id)
        (ok spot-id)
    )
)

;; Update spot availability
(define-public (update-spot-availability (spot-id uint) (is-available bool))
    (let
        (
            (spot (unwrap! (map-get? spots spot-id) err-spot-not-found))
        )
        (asserts! (is-eq tx-sender (get owner spot)) err-not-owner)
        
        (map-set spots spot-id (merge spot {is-available: is-available}))
        (ok true)
    )
)

;; Read-only functions
(define-read-only (get-spot (spot-id uint))
    (map-get? spots spot-id)
)

(define-read-only (get-spot-owner (spot-id uint))
    (match (map-get? spots spot-id)
        spot (some (get owner spot))
        none
    )
)
