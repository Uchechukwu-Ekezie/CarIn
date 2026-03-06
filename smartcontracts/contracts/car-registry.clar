;; car-registry.clar
;; Manages user car registrations for verified renters.

;; Constants
(define-constant err-not-authorized (err u100))
(define-constant err-car-not-found (err u101))

;; Data Variables
(define-data-var car-counter uint u0)

;; Data Maps
(define-map cars
    uint
    {
        owner: principal,
        plate-number: (string-ascii 20),
        make: (string-ascii 50),
        model: (string-ascii 50),
        year: uint
    }
)

;; Keep track of cars owned by a user
(define-map owner-cars principal (list 50 uint))

;; Register a car
(define-public (register-car (plate-number (string-ascii 20)) (make (string-ascii 50)) (model (string-ascii 50)) (year uint))
    (let
        (
            (car-id (+ (var-get car-counter) u1))
            ;; For a fully strict implementation, we would check if the user is verified here
            ;; (is-verified (unwrap! (contract-call? .user-registry is-user-verified tx-sender) err-user-not-verified))
        )
        ;; Optionally restrict to verified users
        ;; (asserts! is-verified err-user-not-verified)

        (map-set cars car-id {
            owner: tx-sender,
            plate-number: plate-number,
            make: make,
            model: model,
            year: year
        })
        
        ;; Add to owner's list of cars
        (let
            ((current-cars (default-to (list) (map-get? owner-cars tx-sender))))
            (map-set owner-cars tx-sender (unwrap! (as-max-len? (append current-cars car-id) u50) err-not-authorized))
        )
        
        (var-set car-counter car-id)
        (ok car-id)
    )
)

;; Update car details
(define-public (update-car (car-id uint) (plate-number (string-ascii 20)) (make (string-ascii 50)) (model (string-ascii 50)) (year uint))
    (let
        (
            (car (unwrap! (map-get? cars car-id) err-car-not-found))
        )
        (asserts! (is-eq (get owner car) tx-sender) err-not-authorized)
        
        (ok (map-set cars car-id {
            owner: tx-sender,
            plate-number: plate-number,
            make: make,
            model: model,
            year: year
        }))
    )
)

;; Read-only functions
(define-read-only (get-car (car-id uint))
    (map-get? cars car-id)
)

(define-read-only (get-owner-cars (owner principal))
    (default-to (list ) (map-get? owner-cars owner))
)
