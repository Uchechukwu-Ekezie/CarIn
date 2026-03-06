;; dispute-resolution.clar
;; Manages disputes and resolves them by integrating with payment-escrow

;; Constants
(define-constant err-not-authorized (err u300))
(define-constant err-dispute-not-found (err u301))
(define-constant err-dispute-already-resolved (err u302))

;; Data Variables
(define-data-var dispute-counter uint u0)
(define-data-var evidence-counter uint u0)
(define-constant contract-owner tx-sender)

;; Data Maps
(define-map disputes
    uint
    {
        escrow-id: uint,
        booking-id: uint,
        filed-by: principal,
        opposing-party: principal,
        reason: (string-utf8 150),
        status: uint ;; 0: Pending, 1: Resolved
    }
)

(define-map evidence
    uint
    {
        dispute-id: uint,
        submitted-by: principal,
        evidence-hash: (string-ascii 64)
    }
)

;; Create Dispute (Simplified version)
(define-public (file-dispute (escrow-id uint) (booking-id uint) (opposing-party principal) (reason (string-utf8 150)))
    (let
        (
            (dispute-id (+ (var-get dispute-counter) u1))
        )
        ;; Note: We would ideally verify that the caller is truly the payer/payee of the escrow
        ;; by making a contract-call to payment-escrow. Keeping this decoupled for simplicity in this MVP.
        
        ;; Inform payment-escrow to lock the funds
        (try! (contract-call? .payment-escrow mark-disputed escrow-id))

        (map-set disputes dispute-id {
            escrow-id: escrow-id,
            booking-id: booking-id,
            filed-by: tx-sender,
            opposing-party: opposing-party,
            reason: reason,
            status: u0
        })
        
        (var-set dispute-counter dispute-id)
        (ok dispute-id)
    )
)

;; Add Evidence
(define-public (add-evidence (dispute-id uint) (evidence-hash (string-ascii 64)))
    (let
        (
            (evidence-id (+ (var-get evidence-counter) u1))
            (dispute (unwrap! (map-get? disputes dispute-id) err-dispute-not-found))
        )
        (asserts! (is-eq (get status dispute) u0) err-dispute-already-resolved)
        (asserts! (or (is-eq tx-sender (get filed-by dispute)) (is-eq tx-sender (get opposing-party dispute))) err-not-authorized)
        
        (map-set evidence evidence-id {
            dispute-id: dispute-id,
            submitted-by: tx-sender,
            evidence-hash: evidence-hash
        })
        
        (var-set evidence-counter evidence-id)
        (ok evidence-id)
    )
)

;; Resolve Dispute
(define-public (resolve-dispute (dispute-id uint) (refund-payer bool))
    (let
        (
            (dispute (unwrap! (map-get? disputes dispute-id) err-dispute-not-found))
            (escrow-id (get escrow-id dispute))
        )
        (asserts! (is-eq (get status dispute) u0) err-dispute-already-resolved)
        (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
        
        ;; Resolve the escrow
        (try! (contract-call? .payment-escrow resolve-dispute escrow-id refund-payer))
        
        (map-set disputes dispute-id (merge dispute {status: u1}))
        (ok true)
    )
)

;; Read-only functions
(define-read-only (get-dispute (dispute-id uint))
    (map-get? disputes dispute-id)
)

(define-read-only (get-evidence (evidence-id uint))
    (map-get? evidence evidence-id)
)
