;; payment-escrow.clar
;; Handles escrowing STX for bookings and releasing/refunding them

;; Constants
(define-constant err-not-authorized (err u200))
(define-constant err-escrow-not-found (err u201))
(define-constant err-escrow-not-pending (err u202))
(define-constant err-release-time-not-reached (err u203))
(define-constant err-amount-mismatch (err u204))

;; Escrow Status Enums
(define-constant status-pending u0)
(define-constant status-released u1)
(define-constant status-refunded u2)
(define-constant status-disputed u3)

;; Data Variables 
(define-data-var escrow-counter uint u0)
(define-constant contract-owner tx-sender)


;; Data Maps
(define-map escrows
    uint
    {
        booking-id: uint,
        payer: principal,
        payee: principal,
        amount: uint,
        release-time: uint,
        status: uint
    }
)

;; Create Escrow
(define-public (create-escrow (booking-id uint) (payee principal) (amount uint) (release-time uint))
    (let
        (
            (escrow-id (+ (var-get escrow-counter) u1))
        )
        (asserts! (> amount u0) err-amount-mismatch)
        
        ;; Transfer STX from payer to this contract
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        (map-set escrows escrow-id {
            booking-id: booking-id,
            payer: tx-sender,
            payee: payee,
            amount: amount,
            release-time: release-time,
            status: status-pending
        })
        
        (var-set escrow-counter escrow-id)
        (ok escrow-id)
    )
)

;; Release Funds to Payee
(define-public (release-funds (escrow-id uint))
    (let
        (
            (escrow (unwrap! (map-get? escrows escrow-id) err-escrow-not-found))
            (payee (get payee escrow))
            (amount (get amount escrow))
        )
        (asserts! (is-eq (get status escrow) status-pending) err-escrow-not-pending)
        (asserts! (>= burn-block-height (get release-time escrow)) err-release-time-not-reached)
        (asserts! (or (is-eq tx-sender payee) (is-eq tx-sender contract-owner)) err-not-authorized)
        
        ;; Transfer STX from contract to payee
        (try! (as-contract (stx-transfer? amount tx-sender payee)))
        
        (map-set escrows escrow-id (merge escrow {status: status-released}))
        (ok true)
    )
)

;; Refund Funds to Payer
(define-public (refund-payer (escrow-id uint))
    (let
        (
            (escrow (unwrap! (map-get? escrows escrow-id) err-escrow-not-found))
            (payer (get payer escrow))
            (amount (get amount escrow))
        )
        (asserts! (is-eq (get status escrow) status-pending) err-escrow-not-pending)
        (asserts! (or (is-eq tx-sender payer) (is-eq tx-sender contract-owner)) err-not-authorized)
        
        ;; Transfer STX from contract to payer
        (try! (as-contract (stx-transfer? amount tx-sender payer)))
        
        (map-set escrows escrow-id (merge escrow {status: status-refunded}))
        (ok true)
    )
)

;; Mark Escrow as Disputed (Can only be called by dispute resolution contract)
;; Keeping simple for now, would typically verify caller against known contracts
(define-public (mark-disputed (escrow-id uint))
    (let
        (
            (escrow (unwrap! (map-get? escrows escrow-id) err-escrow-not-found))
        )
        (asserts! (is-eq (get status escrow) status-pending) err-escrow-not-pending)
        
        (map-set escrows escrow-id (merge escrow {status: status-disputed}))
        (ok true)
    )
)

;; Resolving Disputed Escrow (Simple complete refund or release)
(define-public (resolve-dispute (escrow-id uint) (should-refund bool))
    (let
        (
            (escrow (unwrap! (map-get? escrows escrow-id) err-escrow-not-found))
            (payer (get payer escrow))
            (payee (get payee escrow))
            (amount (get amount escrow))
        )
        (asserts! (is-eq (get status escrow) status-disputed) err-escrow-not-pending)
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        
        (if should-refund
            (begin
                (try! (as-contract (stx-transfer? amount tx-sender payer)))
                (map-set escrows escrow-id (merge escrow {status: status-refunded}))
                (ok true)
            )
            (begin
                (try! (as-contract (stx-transfer? amount tx-sender payee)))
                (map-set escrows escrow-id (merge escrow {status: status-released}))
                (ok true)
            )
        )
    )
)

;; Read-only functions
(define-read-only (get-escrow (escrow-id uint))
    (map-get? escrows escrow-id)
)
