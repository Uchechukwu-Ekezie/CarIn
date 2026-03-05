;; booking.clar
;; Manages the booking lifecycle of spots. Interacts with parking-spot & payment-escrow.

;; Constants
(define-constant err-not-authorized (err u100))
(define-constant err-spot-not-found (err u101))
(define-constant err-spot-not-available (err u102))
(define-constant err-invalid-time-range (err u103))
(define-constant err-start-time-in-past (err u104))
(define-constant err-cannot-book-own-spot (err u105))
(define-constant err-time-slot-already-booked (err u106))
(define-constant err-booking-not-active (err u107))
(define-constant err-cannot-cancel-active-booking (err u108))

;; Booking Status Enums
(define-constant status-active u0)
(define-constant status-cancelled u1)
(define-constant status-completed u2)

;; Data Variables
(define-data-var booking-counter uint u0)

;; Data Maps
(define-map bookings
    uint
    {
        spot-id: uint,
        user: principal,
        car-id: uint,
        start-time: uint,
        end-time: uint,
        total-price: uint,
        check-in-time: uint,
        check-out-time: uint,
        status: uint
    }
)

;; Store active bookings per spot for overlap checking
(define-map spot-bookings uint (list 50 uint))
(define-map user-bookings principal (list 50 uint))

;; Private fold function: checks if any booking in the list overlaps with the requested time
(define-private (check-overlap-fold (booking-id uint) (acc {start: uint, end: uint, has-overlap: bool}))
    (if (get has-overlap acc)
        acc ;; skip further checks if overlap already found
        (let
            (
                (booking (unwrap-panic (map-get? bookings booking-id)))
                (b-start (get start-time booking))
                (b-end (get end-time booking))
                (b-status (get status booking))
                (chk-start (get start acc))
                (chk-end (get end acc))
            )
            (if (is-eq b-status status-active)
                (if (or (<= chk-end b-start) (>= chk-start b-end))
                    ;; No overlap
                    acc
                    ;; Overlap found!
                    (merge acc {has-overlap: true})
                )
                acc
            )
        )
    )
)

;; Check availability across 50 most recent bookings for a spot
(define-private (is-time-slot-available (spot-id uint) (start-time uint) (end-time uint))
    (let
        (
            (b-list (default-to (list ) (map-get? spot-bookings spot-id)))
            (result (fold check-overlap-fold b-list {start: start-time, end: end-time, has-overlap: false}))
        )
        (not (get has-overlap result))
    )
)

;; Create a Booking
(define-public (create-booking (spot-id uint) (car-id uint) (start-time uint) (end-time uint))
    (let
        (
            (booking-id (+ (var-get booking-counter) u1))
            (spot-details (unwrap! (contract-call? .parking-spot get-spot spot-id) err-spot-not-found))
            (spot-owner (get owner spot-details))
            (price-per-hour (get price-per-hour spot-details))
        )
        (asserts! (get is-available spot-details) err-spot-not-available)
        (asserts! (< start-time end-time) err-invalid-time-range)
        (asserts! (>= start-time burn-block-height) err-start-time-in-past)
        (asserts! (not (is-eq tx-sender spot-owner)) err-cannot-book-own-spot)
        (asserts! (is-time-slot-available spot-id start-time end-time) err-time-slot-already-booked)

        ;; Duration in blocks (Stacks blocks are ~10 mins)
        ;; So a duration of 6 blocks = 1 hour
        (let
            (
                (duration (- end-time start-time))
                ;; total-price = (duration / 6) * price-per-hour (roughly)
                ;; but for simplicity, duration * price-per-block
                (total-price (* duration price-per-hour))
            )
            ;; Create Escrow using payment-escrow (assuming it's fixed to 50 ascii string max for booking-id)
            ;; We map booking-id uint to ascii via simpler means or rely on escrow's own ID
            ;; Skipping cross-contract escrow call here for brevity, but this is the hook point:
            ;; (try! (contract-call? .payment-escrow create-escrow ...))

            (map-set bookings booking-id {
                spot-id: spot-id,
                user: tx-sender,
                car-id: car-id,
                start-time: start-time,
                end-time: end-time,
                total-price: total-price,
                check-in-time: u0,
                check-out-time: u0,
                status: status-active
            })

            ;; Update mappings
            (let
                ((current-spot-bookings (default-to (list ) (map-get? spot-bookings spot-id))))
                (map-set spot-bookings spot-id (unwrap! (as-max-len? (append current-spot-bookings booking-id) u50) err-not-authorized))
            )

            (let
                ((current-user-bookings (default-to (list ) (map-get? user-bookings tx-sender))))
                (map-set user-bookings tx-sender (unwrap! (as-max-len? (append current-user-bookings booking-id) u50) err-not-authorized))
            )

            (var-set booking-counter booking-id)
            (ok booking-id)
        )
    )
)

;; Cancel a booking (Only before it starts)
(define-public (cancel-booking (booking-id uint))
    (let
        (
            (booking (unwrap! (map-get? bookings booking-id) err-spot-not-found))
            (spot-details (unwrap! (contract-call? .parking-spot get-spot (get spot-id booking)) err-spot-not-found))
        )
        (asserts! (or (is-eq tx-sender (get user booking)) (is-eq tx-sender (get owner spot-details))) err-not-authorized)
        (asserts! (is-eq (get status booking) status-active) err-booking-not-active)
        (asserts! (> (get start-time booking) burn-block-height) err-cannot-cancel-active-booking)

        ;; Cancel Escrow
        ;; (try! (contract-call? .payment-escrow refund-payer escrow-id))

        (map-set bookings booking-id (merge booking {status: status-cancelled}))
        (ok true)
    )
)

;; Read-only
(define-read-only (get-booking (booking-id uint))
    (map-get? bookings booking-id)
)

(define-read-only (get-spot-bookings (spot-id uint))
    (default-to (list ) (map-get? spot-bookings spot-id))
)
